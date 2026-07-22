const url = 'https://script.google.com/macros/s/AKfycbxRQtIUr5rYPsLrbL4SJLZt8mwJBXVF1Z1xim_aJux0IuGy72GXk9qGC7HH5JB-MNPvdA/exec';

async function sendPost(payload) {
  console.log("Sending:", payload.action, payload.traineeId || (payload.data && payload.data.traineeId));
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain' }
  });
  const data = await res.json();
  console.log("Response:", data);
}

async function run() {
  const trainees = ['diane', 'mark', 'jairuz'];
  const traineeNames = { 'diane': 'Diane', 'mark': 'Mark', 'jairuz': 'Jairuz' };
  
  // 1. Submit assessments
  for (const t of trainees) {
    await sendPost({
      action: 'submitAssessment',
      traineeId: t,
      department: 'yushan_prep',
      grade: 85 + Math.floor(Math.random() * 10),
      competency1: 4,
      competency2: 5,
      competency3: 4,
      competency4: 5,
      competency5: 4,
      comments: 'Great progress in pre-processing unit. Needs a bit more focus on speed.',
      assessor: 'Guest Reviewer'
    });
  }

  // 2. Submit observations
  for (const t of trainees) {
    await sendPost({
      action: 'submitObservation',
      data: {
        traineeId: t,
        traineeName: traineeNames[t],
        date: '2026-07-16',
        department: 'yushan_prep',
        keyObservation: 'Learned how to properly sanitize and prepare ingredients efficiently.',
        actionableIdea: 'We could introduce color-coded prep stations in PH.',
        attachmentUrl: 'https://docs.google.com/document/d/12345/edit'
      }
    });
  }
}

run();
