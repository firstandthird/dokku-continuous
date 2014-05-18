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
      var branch = data.ref.replace('refs/head/', '');
      var branchSlug =  branch.replace(/\//g, '-');

      var target = (prefix) ? prefix +'-'+ branchSlug : branchSlug;

      var cmdArr = [
        __dirname + '/deploy',
        process.env.GITHUBTOKEN,
        user,
        repo,
        branch,
        target,
        '/repos'
      ];
      console.log(cmdArr);
      exec(cmdArr.join(' '), function(err, stdout, stderr) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        console.log(err);
        console.log('out', stdout);
        console.log('err', stderr);
        if (err) {
          return res.end(JSON.stringify(err));
        }
        res.end('done');
      });

    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    exec('ssh -o StrictHostKeyChecking=no dokku@172.17.42.1 help', function(err, stdout, stderr) {
      console.log(arguments);
      res.end(JSON.stringify(stdout));
    });
  }
}).listen(port, '0.0.0.0');

console.log('Server running at http://localhost:'+port+'/');
