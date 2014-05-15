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

      var prefix = req.url.substr(1);
      var repo = data.repository.name;
      var user = data.repository.owner.name;
      var branchSplit = data.ref.split('/');
      var branch = branchSplit[branchSplit.length-1];

      var target = (prefix) ? prefix +'-'+ branch : branch;

      console.log(prefix, repo, user, branch, target);

    });
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('ok');
}).listen(port, '0.0.0.0');

console.log('Server running at http://localhost:'+port+'/');
