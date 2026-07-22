import urllib.request
import json
import time

url = 'https://script.google.com/macros/s/AKfycbxGO8qhJGBMmDueIkz-lse9c3PKsr7lGDdItToojUi-zUozIl6ogt-J-KmGkxKlzbe1Eg/exec'

holidays = {
    '2026-10-26': '光復節補假 (Retrocession Day Compensated Holiday)'
}

trainees = ['diane', 'jairuz', 'mark']

print("Updating Google Sheet...")
for trainee in trainees:
    for date, obj in holidays.items():
        data = {
            'action': 'updateSchedule',
            'traineeId': trainee,
            'date': date,
            'dept': 'holiday',
            'objective': obj
        }
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='POST')
        req.add_header('Content-Type', 'text/plain')
        try:
            with urllib.request.urlopen(req) as response:
                print(f"Updated {trainee} {date}")
        except Exception as e:
            print(f"Error updating {trainee} {date}: {e}")
        time.sleep(0.5)
print("Done")
