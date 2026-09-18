import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

docs = db.collection('observations').get()
deleted_count = 0
for doc in docs:
    data = doc.to_dict()
    if '16:31:23' in str(data.get('submittedAt', '')):
        print(f"Deleting fake doc: {doc.id}")
        db.collection('observations').document(doc.id).delete()
        deleted_count += 1
print(f"Deleted {deleted_count} fake documents.")
