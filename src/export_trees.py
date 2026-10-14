import joblib
import json
from pathlib import Path
from sklearn.tree import _tree

def tree_to_dict(model, feature_names, class_names):
    tree_ = model.tree_
    def recurse(node):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            feat_idx = tree_.feature[node]
            name = feature_names[feat_idx] if feat_idx < len(feature_names) else f"feat_{feat_idx}"
            threshold = float(tree_.threshold[node])
            return {
                "type": "split",
                "feature": name,
                "threshold": round(threshold, 5),
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
                "type": "leaf",
                "prediction": str(pred_label),
                "confidence": round(conf * 100, 1)
            }
    return recurse(0)

# Binary
bin_path = list(Path("models").glob("*_binary_DecisionTree_k5.joblib"))[0]
bin_art = joblib.load(bin_path)
bin_tree = tree_to_dict(bin_art["model"], bin_art["features"], ["Benign", "Attack"])

# Multiclass
mul_path = list(Path("models").glob("*_multiclass_DecisionTree_k20.joblib"))[0]
mul_art = joblib.load(mul_path)
mul_tree = tree_to_dict(mul_art["model"], mul_art["features"], mul_art["classes"])

# Also get scaler parameters
scaler = bin_art.get("scaler")
scaler_dict = {}
if scaler and hasattr(scaler, "mean_"):
    for idx, f in enumerate(scaler.feature_names_in_):
        scaler_dict[f] = {
            "mean": float(scaler.mean_[idx]),
            "scale": float(scaler.scale_[idx])
        }

payload = {
    "binary_tree": bin_tree,
    "multiclass_tree": mul_tree,
    "binary_features": bin_art["features"],
    "multiclass_features": mul_art["features"],
    "scaler": scaler_dict
}

out_path = Path("web/public/data/trained_trees.json")
out_path.parent.mkdir(parents=True, exist_ok=True)
with open(out_path, "w") as f:
    json.dump(payload, f, indent=2)

print("SUCCESS: Exact decision tree rules exported to web/public/data/trained_trees.json!")
