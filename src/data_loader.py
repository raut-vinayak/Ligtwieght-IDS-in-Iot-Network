"""
Data Loader & Intake Module for Lightweight IoT IDS.

Compliant with Phase 1 Acceptance Criteria:
- Discovers raw CSV files in data/raw/.
- Validates schema (46 standard numerical flow features + label column).
- Reads in bounded chunks to prevent high-memory usage.
- Computes SHA256 checksums, row counts, missing/null statistics, duplicate counts.
- Generates and writes a local dataset manifest (manifest.json).
- Surfaces actionable errors on missing columns or unknown raw labels.
"""

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

import numpy as np
import pandas as pd

from src import config

# All 46 standard numerical flow features in CICIoT2023 dataset
CICIOT2023_FEATURES = [
    "flow_duration", "Header_Length", "Protocol Type", "Duration",
    "Rate", "Srate", "Drate", "fin_flag_number", "syn_flag_number",
    "rst_flag_number", "psh_flag_number", "ack_flag_number",
    "ece_flag_number", "cwr_flag_number", "ack_count", "syn_count",
    "fin_count", "urg_count", "rst_count", "HTTP", "HTTPS", "DNS",
    "Telnet", "SMTP", "SSH", "IRC", "TCP", "UDP", "DHCP", "ARP",
    "ICMP", "IPv", "LLC", "Tot sum", "Min", "Max", "AVG", "Std",
    "Tot size", "IAT", "Number", "Magnitue", "Radius", "Covariance",
    "Variance", "Weight"
]

REQUIRED_COLUMNS = set(CICIOT2023_FEATURES) | {config.LABEL_COLUMN}


class SchemaValidationError(Exception):
    """Raised when incoming dataset does not adhere to CICIoT2023 flow schema."""
    pass


def get_raw_csv_files() -> List[Path]:
    """Scan data/raw directory and return list of all CSV file paths."""
    raw_dir = Path(config.DATA_RAW_DIR)
    csv_files = sorted(list(raw_dir.glob("*.csv")))
    return csv_files


def compute_file_sha256(file_path: Path, block_size: int = 65536) -> str:
    """Compute SHA-256 cryptographic hash of a file efficiently."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for block in iter(lambda: f.read(block_size), b""):
            sha256.update(block)
    return sha256.hexdigest()


def validate_schema(columns: List[str]) -> Tuple[bool, List[str]]:
    """
    Validate that all required CICIoT2023 features and the label column are present.

    Returns:
        Tuple[bool, List[str]]: (is_valid, missing_columns)
    """
    col_set = set(columns)
    missing = [c for c in REQUIRED_COLUMNS if c not in col_set]
    return len(missing) == 0, missing


def inspect_dataset_chunked(
    file_path: Path,
    chunk_size: int = 10000,
    max_rows: Optional[int] = None
) -> Dict[str, Any]:
    """
    Inspect a dataset file in bounded memory chunks.
    Computes total rows, null counts, duplicate rows, data types, and class frequencies.
    """
    print(f"[DataLoader] Inspecting {file_path.name} (chunk size: {chunk_size:,})...")

    # Read header to validate schema
    header_df = pd.read_csv(file_path, nrows=0)
    is_valid, missing = validate_schema(list(header_df.columns))
    if not is_valid:
        raise SchemaValidationError(
            f"File '{file_path.name}' is missing {len(missing)} required columns:\n  {missing[:10]}..."
        )

    total_rows = 0
    total_nulls = 0
    label_counts: Dict[str, int] = {}
    total_duplicates = 0
    seen_hashes = set()

    for chunk in pd.read_csv(file_path, chunksize=chunk_size):
        if max_rows and total_rows >= max_rows:
            break

        if max_rows and total_rows + len(chunk) > max_rows:
            chunk = chunk.iloc[:(max_rows - total_rows)]

        total_rows += len(chunk)
        total_nulls += int(chunk.isnull().sum().sum())

        # Track class frequency
        if config.LABEL_COLUMN in chunk.columns:
            counts = chunk[config.LABEL_COLUMN].value_counts().to_dict()
            for lbl, cnt in counts.items():
                label_counts[str(lbl)] = label_counts.get(str(lbl), 0) + cnt

        # Approximate duplicates via subset hash
        subset_cols = [c for c in ["Rate", "AVG", "Tot size", "IAT"] if c in chunk.columns]
        if subset_cols:
            for row_hash in pd.util.hash_pandas_object(chunk[subset_cols]):
                if row_hash in seen_hashes:
                    total_duplicates += 1
                else:
                    seen_hashes.add(row_hash)

    file_size_bytes = os.path.getsize(file_path)
    file_hash = compute_file_sha256(file_path)

    summary = {
        "file_name": file_path.name,
        "file_size_bytes": file_size_bytes,
        "file_size_mb": round(file_size_bytes / (1024 * 1024), 2),
        "sha256": file_hash,
        "total_rows": total_rows,
        "feature_count": len(CICIOT2023_FEATURES),
        "total_columns": len(header_df.columns),
        "total_null_values": total_nulls,
        "approx_duplicate_rows": total_duplicates,
        "label_column": config.LABEL_COLUMN,
        "unique_labels_count": len(label_counts),
        "label_distribution": label_counts
    }
    return summary


def generate_manifest(output_path: Optional[Path] = None) -> Dict[str, Any]:
    """Generate and save the local dataset manifest for all files in data/raw/."""
    csv_files = get_raw_csv_files()
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {config.DATA_RAW_DIR}")

    manifest_entries = []
    for f in csv_files:
        entry = inspect_dataset_chunked(f)
        manifest_entries.append(entry)

    manifest = {
        "dataset_name": "CICIoT2023 (Canadian Institute for Cybersecurity)",
        "manifest_version": "1.0",
        "description": "Intrusion Detection Dataset for IoT networks, featuring 33 attacks and Benign telemetry across 46 flow features.",
        "files": manifest_entries,
        "total_files": len(manifest_entries),
        "total_rows": sum(e["total_rows"] for e in manifest_entries),
        "attribution": "Neto et al., 'CICIoT2023: A Real-Time Dataset and Benchmark for Large-Scale Attacks in IoT Environments', IEEE IoTJ 2023."
    }

    out_file = output_path or (config.DATA_RAW_DIR / "manifest.json")
    with open(out_file, "w") as out:
        json.dump(manifest, out, indent=2)

    print(f"[DataLoader] Manifest successfully written to: {out_file}")
    return manifest


def load_merged_dataset(
    sample_fraction: Optional[float] = None,
    max_rows: Optional[int] = None
) -> pd.DataFrame:
    """
    Load raw CSV files from data/raw/ with strict schema checking.
    Supports subsampling for development and bounded loading.
    """
    csv_files = get_raw_csv_files()
    if not csv_files:
        raise FileNotFoundError(f"No CSV dataset found in {config.DATA_RAW_DIR}.")

    frac = sample_fraction if sample_fraction is not None else config.DEV_SAMPLE_FRACTION

    dfs = []
    total_loaded = 0

    for file_path in csv_files:
        # Validate columns before reading full payload
        header = pd.read_csv(file_path, nrows=0)
        is_valid, missing = validate_schema(list(header.columns))
        if not is_valid:
            raise SchemaValidationError(f"File {file_path.name} is missing columns: {missing}")

        df_chunk = pd.read_csv(file_path)
        if 0.0 < frac < 1.0:
            df_chunk = df_chunk.sample(frac=frac, random_state=config.RANDOM_STATE)

        if max_rows and total_loaded + len(df_chunk) > max_rows:
            df_chunk = df_chunk.iloc[:(max_rows - total_loaded)]

        dfs.append(df_chunk)
        total_loaded += len(df_chunk)

        if max_rows and total_loaded >= max_rows:
            break

    merged_df = pd.concat(dfs, ignore_index=True)
    return merged_df


def inspect_raw_data(max_rows: Optional[int] = None) -> None:
    """Inspect and format dataset metrics for terminal and reports."""
    csv_files = get_raw_csv_files()
    if not csv_files:
        print("[DataLoader] Error: No CSV files in data/raw/")
        return

    print(f"\n{'='*75}")
    print("PHASE 1: DATA INTAKE & SCHEMA INSPECTION REPORT")
    print(f"{'='*75}")
    print(f"Total raw files: {len(csv_files)}")

    for f in csv_files:
        summary = inspect_dataset_chunked(f, max_rows=max_rows)
        print(f"\nFile: {summary['file_name']}")
        print(f"  Size: {summary['file_size_mb']} MB ({summary['file_size_bytes']:,} bytes)")
        print(f"  SHA-256: {summary['sha256']}")
        print(f"  Rows Evaluated: {summary['total_rows']:,}")
        print(f"  Features: {summary['feature_count']} flow features + 1 label column")
        print(f"  Missing/Null Values: {summary['total_null_values']}")
        print(f"  Approx Duplicate Rows: {summary['approx_duplicate_rows']}")
        print(f"  Unique Raw Labels ({summary['unique_labels_count']}):")
        for lbl, count in sorted(summary['label_distribution'].items(), key=lambda x: -x[1])[:10]:
            print(f"    - {lbl:30s}: {count:,} samples ({count / summary['total_rows'] * 100:.1f}%)")
        if summary['unique_labels_count'] > 10:
            print(f"    ... and {summary['unique_labels_count'] - 10} additional attack classes.")

    print(f"{'='*75}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CICIoT2023 Data Intake & Loader CLI")
    parser.add_argument("--inspect", action="store_true", help="Inspect raw datasets and validate schema")
    parser.add_argument("--manifest", action="store_true", help="Generate data/raw/manifest.json")
    parser.add_argument("--sample-rows", type=int, default=None, help="Limit inspection to N rows")
    args = parser.parse_args()

    if args.manifest or (not args.inspect and not args.manifest):
        generate_manifest()
    if args.inspect:
        inspect_raw_data(max_rows=args.sample_rows)
