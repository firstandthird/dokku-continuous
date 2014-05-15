var http = require('http');
var qs = require('querystring');
var exec = require('child_process').exec;

var port = process.env.PORT || 8000;

if (!process.env.GITHUBTOKEN) {
  throw new Error('GITHUBTOKEN must be set in env');
}

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

      var cmdArr = [
        __dirname + '/deploy',
        process.env.GITHUB_TOKEN,
        user,
        repo,
        branch,
        target,
        '.'
      ];
      console.log(cmdArr);
      exec(cmdArr.join(' '), function(err, stdout, stderr) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        if (err) {
          return res.end(JSON.stringify(err));
        }
        res.end('done');
      });

    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('ok');
  }
}).listen(port, '0.0.0.0');

console.log('Server running at http://localhost:'+port+'/');
