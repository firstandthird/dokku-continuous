var http = require('http');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var qs = require('querystring');

var port = process.env.PORT || 8000;

if (!process.env.GITHUBTOKEN) {
  throw new Error('GITHUBTOKEN must be set in env');
}

var deploy = function(user, repo, branch, prefix, callback) {
  var branchSlug =  branch.replace(/\//g, '-');

  var target = (prefix) ? prefix +'-'+ branchSlug : branchSlug;
  console.log('DEPLOYING: '+user+'/'+repo+'@'+branch +' to '+target);

  var args = [
    process.env.GITHUBTOKEN,
    user,
    repo,
    branch,
    target,
    '/repos'
  ];
  var deploy = spawn(__dirname + '/deploy', args);
  deploy.stdout.on('data', function(data) {
    process.stdout.write('OUT: '+ data.toString());
  });
  deploy.stderr.on('data', function(data) {
    process.stdout.write('ERROR: '+ data.toString());
  });
  deploy.on('close', function(code) {
    console.log('DEPLOY COMPLETE');
    callback();
  });
};

http.createServer(function (req, res) {
  console.log('NEW REQUEST at ', new Date().toString(), ' - ', req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});

  if (req.url == '/_ssh') {
    exec('ssh -o StrictHostKeyChecking=no dokku@172.17.42.1 help', function(err, stdout, stderr) {
      res.end(stdout);
    });
    return;
  }

  if (req.url.match(/^\/_deploy/)) {
    var query = req.url.split('?')[1];
    var data = qs.parse(query);
    deploy(data.user, data.repo, data.branch, data.prefix, function(err) {
      if (err) {
        console.log('ERROR', err);
      }
      res.end('ok');
    });
    return;
  }


  if (req.method == 'POST') {

    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      var data = JSON.parse(body);
      if (!data.repository) {
        return console.log('HOOK: Got hook from github, but not pull');
      } else {
        console.log('Push hook received from github');
      }

      var prefix = req.url.substr(1);
      var repo = data.repository.name;
      var user = data.repository.owner.name;
      if (data.ref.indexOf('tag') != -1) {
        console.log('Got tag, skipping');
      }
      var branch = data.ref.replace('refs/heads/', '');
      res.end('ok');

      deploy(user, repo, branch, prefix, function(err) {
        if (err) {
          console.log('ERROR', err);
        }
      });


    });
  }
}).listen(port, '0.0.0.0');

console.log('Server running at http://localhost:'+port+'/');
