import urllib.request
import json
import random

url = 'https://script.google.com/macros/s/AKfycbxRQtIUr5rYPsLrbL4SJLZt8mwJBXVF1Z1xim_aJux0IuGy72GXk9qGC7HH5JB-MNPvdA/exec'

def send_post(payload):
    print("Sending:", payload.get('action'))
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'text/plain'})
    response = urllib.request.urlopen(req)
    print("Response:", response.read().decode('utf-8'))

trainees = ['diane', 'mark', 'jairuz']
trainee_names = {'diane': 'Diane', 'mark': 'Mark', 'jairuz': 'Jairuz'}

for t in trainees:
    send_post({
        'action': 'submitAssessment',
        'traineeId': t,
        'department': 'yushan_prep',
        'grade': 85 + random.randint(0, 10),
        'competency1': 4,
        'competency2': 5,
        'competency3': 4,
        'competency4': 5,
        'competency5': 4,
        'comments': 'Great progress in pre-processing unit. Needs a bit more focus on speed.',
        'assessor': 'Guest Reviewer'
    })

for t in trainees:
    send_post({
        'action': 'submitObservation',
        'data': {
            'traineeId': t,
            'traineeName': trainee_names[t],
            'date': '2026-07-16',
            'department': 'yushan_prep',
            'keyObservation': 'Learned how to properly sanitize and prepare ingredients efficiently.',
            'actionableIdea': 'We could introduce color-coded prep stations in PH.',
            'attachmentUrl': 'https://docs.google.com/document/d/12345/edit'
        }
    })
