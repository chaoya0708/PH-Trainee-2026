const fetch = require('node-fetch');
const url = 'https://script.google.com/macros/s/AKfycbxGO8qhJGBMmDueIkz-lse9c3PKsr7lGDdItToojUi-zUozIl6ogt-J-KmGkxKlzbe1Eg/exec';
const base64Str = 'data:text/plain;base64,SGVsbG8gV29ybGQh'; // "Hello World!"
const data = {
  action: 'uploadFile',
  base64: base64Str,
  mimeType: 'text/plain',
  filename: 'test.txt'
};

fetch(url, {
  method: 'POST',
  body: JSON.stringify(data),
  headers: { 'Content-Type': 'text/plain' }
})
.then(res => res.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
