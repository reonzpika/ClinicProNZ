import pandas as pd
import json

# Load Excel
df = pd.read_excel("acc_codes.xlsx")

# Use only Preferred Term as text
documents = []
for _, row in df.iterrows():
    doc = {
        "text": row["Preferred term"],
        "metadata": {
            "read_code": row["Read code"],
            "read_term": row["Read Term"],
            "category": ["acc"]
        }
    }
    documents.append(doc)

# Save as a single JSON array (required for OpenAI)
with open("acc_codes.json", "w", encoding="utf-8") as f:
    json.dump(documents, f, ensure_ascii=False, indent=2)
