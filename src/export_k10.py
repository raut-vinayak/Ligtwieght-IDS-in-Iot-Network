"""
Export exact K=10 models for both Binary and Multiclass to exact_inference_engine.json and contracts.
"""
import json
from pathlib import Path
import joblib
from sklearn.tree import _tree
import numpy as np

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

# Load K=10 models
models_dir = Path("models")
bin_path = list(models_dir.glob("*_binary_DecisionTree_k10.joblib"))[0]
mul_path = list(models_dir.glob("*_multiclass_DecisionTree_k10.joblib"))[0]

bin_art = joblib.load(bin_path)
mul_art = joblib.load(mul_path)

bin_features = bin_art["features"]
mul_features = mul_art["features"]

bin_classes = [str(c) for c in bin_art["classes"]]
mul_classes = [str(c) for c in mul_art["classes"]]

bin_tree = tree_to_dict(bin_art["model"], bin_features, bin_classes)
mul_tree = tree_to_dict(mul_art["model"], mul_features, mul_classes)

engine_payload = {
    "k": 10,
    "binary_features": bin_features,
    "multiclass_features": mul_features,
    "binary_tree_raw": bin_tree,
    "multiclass_tree_raw": mul_tree,
}

out_engine = Path("web/public/data/exact_inference_engine.json")
with open(out_engine, "w") as f:
    json.dump(engine_payload, f, indent=2)

print(f"Updated exact_inference_engine.json with K=10 trees!")
print(f"Binary 10 features: {bin_features}")
print(f"Multiclass 10 features: {mul_features}")

# Update contract JSONs for K=10
bin_contract = {
    "model_name": "DecisionTree",
    "task": "binary",
    "k": 10,
    "features": bin_features,
    "classes": bin_classes
}
mul_contract = {
    "model_name": "DecisionTree",
    "task": "multiclass",
    "k": 10,
    "features": mul_features,
    "classes": mul_classes
}

with open("web/public/data/ids_binary_contract.json", "w") as f:
    json.dump(bin_contract, f, indent=2)

with open("web/public/data/ids_multiclass_contract.json", "w") as f:
    json.dump(mul_contract, f, indent=2)

print("Contracts updated for K=10!")
