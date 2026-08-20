import json

files = ['scratch/full_data.json', 'scratch/gas_data.json', 'scratch/correct_scheds.json']

for filename in files:
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        
        updated = False
        for obs in data.get('observations', []):
            if obs.get('traineeId') == 'diane' and obs.get('targetWeek') == '2026-08-10~2026-08-14':
                obs['selfRating'] = 4.5
                updated = True
                
        if updated:
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"Updated {filename}")
    except FileNotFoundError:
        pass
    except Exception as e:
        print(f"Error reading {filename}: {e}")

