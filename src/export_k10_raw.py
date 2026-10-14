"""
Export exact unscaled Decision Tree rules for K=10 for both Binary and Multiclass tasks.
Generates web/public/data/exact_inference_engine.json and contracts.
"""
import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier, _tree
from sklearn.metrics import f1_score

from src.data_loader import load_merged_dataset
from src.preprocess import prepare_features_and_labels, stratified_3way_split

def tree_to_dict(model, feature_names, class_names):
    tree_ = model.tree_
    def recurse(node):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            feat_idx = tree_.feature[node]
            name = feature_names[feat_idx] if feat_idx < len(feature_names) else f"feat_{feat_idx}"
            threshold = float(tree_.threshold[node])
            return {
                "feature": name,
                "threshold": round(threshold, 4),
                "left": recurse(tree_.children_left[node]),
                "right": recurse(tree_.children_right[node])
            }
        else:
            val = tree_.value[node][0]
            pred_idx = int(val.argmax())
            total = float(val.sum())
            conf = float(val[pred_idx] / total) if total > 0 else 1.0
            pred_label = class_names[pred_idx] if pred_idx < len(class_names) else str(pred_idx)
            return {
                "prediction": str(pred_label),
                "confidence": round(conf * 100, 1)
            }
    return recurse(0)

# Load data
raw_df = load_merged_dataset(sample_fraction=0.1)

# 1. Binary K=10
X_bin, y_bin, _ = prepare_features_and_labels(raw_df, task='binary')
X_tr_b, X_va_b, X_te_b, y_tr_b, y_va_b, y_te_b = stratified_3way_split(X_bin, y_bin)

k10_binary_feats = [
    "Number", "ack_count", "IAT", "Srate", "syn_count",
    "AVG", "HTTPS", "ack_flag_number", "syn_flag_number", "Tot size"
]

dt_bin = DecisionTreeClassifier(max_depth=10, random_state=42)
dt_bin.fit(X_tr_b[k10_binary_feats].fillna(0), y_tr_b)
bin_pred = dt_bin.predict(X_te_b[k10_binary_feats].fillna(0))
bin_f1 = f1_score(y_te_b, bin_pred, average="macro")
print(f"Binary K=10 Test Macro-F1: {bin_f1:.4f}")

bin_tree = tree_to_dict(dt_bin, k10_binary_feats, ["Benign", "Attack"])

# 2. Multiclass K=10
X_mul, y_mul, _ = prepare_features_and_labels(raw_df, task='multiclass')
X_tr_m, X_va_m, X_te_m, y_tr_m, y_va_m, y_te_m = stratified_3way_split(X_mul, y_mul)

k10_multi_feats = [
    "Rate", "syn_count", "ack_count", "AVG", "Number",
    "Tot sum", "syn_flag_number", "Drate", "Variance", "IAT"
]

dt_mul = DecisionTreeClassifier(max_depth=12, random_state=42)
dt_mul.fit(X_tr_m[k10_multi_feats].fillna(0), y_tr_m)
mul_pred = dt_mul.predict(X_te_m[k10_multi_feats].fillna(0))
mul_f1 = f1_score(y_te_m, mul_pred, average="macro")
print(f"Multiclass K=10 Test Macro-F1: {mul_f1:.4f}")

classes_mul = sorted(list(set(y_tr_m.unique())))
mul_tree = tree_to_dict(dt_mul, k10_multi_feats, classes_mul)

# Save exact_inference_engine.json
engine_payload = {
    "k": 10,
    "binary_features": k10_binary_feats,
    "multiclass_features": k10_multi_feats,
    "binary_macro_f1": round(bin_f1, 4),
    "multiclass_macro_f1": round(mul_f1, 4),
    "binary_tree_raw": bin_tree,
    "multiclass_tree_raw": mul_tree
}

out_engine = Path("web/public/data/exact_inference_engine.json")
with open(out_engine, "w") as f:
    json.dump(engine_payload, f, indent=2)

print("Exact K=10 inference engine written successfully!")

# Also generate sample CSV for K=10 flows
sample_test_rows = X_te_m[k10_multi_feats].head(20).copy()
sample_test_rows.to_csv("web/public/data/sample_traffic_for_prediction.csv", index=False)
print("Updated sample_traffic_for_prediction.csv for K=10!")
