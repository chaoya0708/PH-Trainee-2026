const html = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="test">';
const regex = /<img[^>]*src="data:image\/[^;]+;base64,([^"]+)"[^>]*>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  console.log('Matched:', match[0]);
  console.log('Base64:', match[1].substring(0, 20) + '...');
}
