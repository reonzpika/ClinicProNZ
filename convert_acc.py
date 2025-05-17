import json
import csv

with open("acc_codes.jsonl", "r", encoding="utf-8") as infile, \
     open("acc_codes.csv", "w", encoding="utf-8", newline="") as outfile:
    writer = csv.writer(outfile)
    writer.writerow(["text", "read_code", "read_term"])
    for line in infile:
        obj = json.loads(line)
        writer.writerow([
            obj["text"],
            obj["metadata"]["read_code"],
            obj["metadata"]["read_term"]
        ])