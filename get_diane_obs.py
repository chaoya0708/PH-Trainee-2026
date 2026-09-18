import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

docs = db.collection('observations').where('traineeId', '==', 'trainee_2').get()
for doc in docs:
    data = doc.to_dict()
    print(f"ID: {doc.id} | Dept: {data.get('department')} | Week: {data.get('targetWeek')} | Rating: {data.get('selfRating')} | Date: {data.get('submittedAt')}")
