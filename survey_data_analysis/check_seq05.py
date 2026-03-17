import json
import numpy as np

schema = {item['field_id']: item for item in (json.loads(l) for l in open('data/schema.jsonl'))}
responses = [json.loads(l) for l in open('data/responses.jsonl')]

seq05_fields = [fid for fid, item in schema.items() if item['group_id'] == 'SEQ05']
print('SEQ05 fields:')
for fid in seq05_fields:
    opts = schema[fid].get('options')
    print(f"  {fid}: {schema[fid]['question']}")
    print(f"    options: {opts}")

print()
print('Missing rate per field:')
for fid in seq05_fields:
    vals = [r['answers'].get(fid) for r in responses]
    missing = sum(1 for v in vals if v is None)
    print(f"  {fid}: {missing}/{len(vals)} missing ({missing/len(vals):.1%})")
    non_null = [v for v in vals if v is not None]
    if non_null:
        print(f"    sample values: {non_null[:10]}")
