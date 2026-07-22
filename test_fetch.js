const https = require('https');

const fileId = '1t-1A-sIOMmB0sJ93x1Yh7r_g2g7Y-K_O'; // A random public pdf file id
const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(directUrl);

https.get(proxyUrl, (res) => {
  console.log("Status Code:", res.statusCode);
  console.log("Headers:", res.headers);
  let data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    let buffer = Buffer.concat(data);
    console.log("Size:", buffer.length);
    console.log("Start:", buffer.toString('utf8', 0, 100));
  });
});
