"""
CLI entry point for training and evaluation.
Delegates to src.evaluate.execute_full_benchmark.
"""

import argparse
from src.evaluate import execute_full_benchmark
from src import config

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lightweight IDS Training CLI")
    parser.add_argument("--task", type=str, default="binary", choices=["binary", "multiclass", "both"])
    parser.add_argument("--sample-fraction", type=float, default=None)
    parser.add_argument("--seed", type=int, default=config.RANDOM_STATE)
    parser.add_argument("--run-id", type=str, default=None)
    args = parser.parse_args()

    frac = args.sample_fraction if args.sample_fraction else config.DEV_SAMPLE_FRACTION

    if args.task in ["binary", "both"]:
        execute_full_benchmark(task="binary", sample_fraction=frac, run_id=args.run_id)
    if args.task in ["multiclass", "both"]:
        execute_full_benchmark(task="multiclass", sample_fraction=frac, run_id=args.run_id)
