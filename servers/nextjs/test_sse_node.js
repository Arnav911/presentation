const http = require('http');

http.get({
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/v1/ppt/outlines/stream/32b77499-400c-4c3b-a96c-c5a6e300dd7e',
  headers: {
    'Accept': 'text/event-stream'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  res.on('data', (chunk) => console.log('BODY: ' + chunk));
  res.on('end', () => console.log('No more data in response.'));
}).on('error', (e) => console.error('Got error: ' + e.message));
