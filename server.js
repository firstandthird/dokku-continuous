var http = require('http');
var qs = require('querystring');

var port = process.env.PORT || 8000;

http.createServer(function (req, res) {

  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {

      var data = JSON.parse(body);

      console.log(data);
      // use POST

    });
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('ok');
}).listen(port, '127.0.0.1');

console.log('Server running at http://127.0.0.1:'+port+'/');
