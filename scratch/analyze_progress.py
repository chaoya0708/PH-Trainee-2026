import urllib.request
import json
import math

project_id = "ph-trainee-2026"
obs_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/observations"
assess_url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/assessments"

def get_all(url):
    results = []
    next_page = None
    while True:
        req_url = url
        if next_page:
            req_url += f"?pageToken={next_page}"
        req = urllib.request.Request(req_url)
        res = urllib.request.urlopen(req)
        data = json.loads(res.read())
        results.extend(data.get('documents', []))
        next_page = data.get('nextPageToken')
        if not next_page:
            break
    return results

observations = get_all(obs_url)
assessments = get_all(assess_url)

obs_parsed = []
for doc in observations:
    fields = doc.get('fields', {})
    obs_parsed.append({
        'traineeId': fields.get('traineeId', {}).get('stringValue', ''),
        'department': fields.get('department', {}).get('stringValue', ''),
        'status': fields.get('status', {}).get('stringValue', '')
    })

assess_parsed = []
for doc in assessments:
    fields = doc.get('fields', {})
    assess_parsed.append({
        'traineeId': fields.get('traineeId', {}).get('stringValue', ''),
        'department': fields.get('department', {}).get('stringValue', ''),
        'grade': fields.get('grade', {}).get('stringValue', '')
    })

depts = [
    'cmf_production_hunei', 'cmf_production_rende', 'cmf_qc', 'cmf_rd_chinese', 'cmf_rd_western',
    'yushan_qc', 'yushan_prep', 'yushan_cooking', 'yushan_packaging', 'yushan_warehouse'
]

trainees = {
    'diane': ['cmf_production_rende'],
    'mark': ['cmf_production_rende'],
    'jairuz': ['cmf_production_hunei']
}

for trainee, excluded in trainees.items():
    total_score = 0
    active_depts = [d for d in depts if d not in excluded]
    for dept in active_depts:
        dept_obs = [o for o in obs_parsed if o['traineeId'] == trainee and o['department'] == dept]
        dept_assess = [a for a in assess_parsed if a['traineeId'] == trainee and a['department'] == dept]
        
        c1 = len(dept_obs) > 0
        c2 = any(o['status'].strip().lower() == 'reviewed' for o in dept_obs)
        c3 = len(dept_assess) > 0
        c4 = len(dept_assess) > 0 and dept_assess[0]['grade'].strip().upper() in ['A+', 'A', 'B']
        
        score = 0
        if c1: score += 25
        if c2: score += 25
        if c3: score += 25
        if c4: score += 25
        
        total_score += score
        if score > 0:
            print(f"{trainee} - {dept}: {score}% (c1:{c1}, c2:{c2}, c3:{c3}, c4:{c4})")
            
    avg = round(total_score / len(active_depts)) if active_depts else 0
    print(f"{trainee} OVERALL: {avg}% (Total Score: {total_score})\n")

