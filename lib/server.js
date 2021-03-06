const path = require('path');
const GitServer = require('node-git-server');

const engine = require('./engine');
const app = require('./app');

const DIR = process.env.DIR || path.resolve(__dirname, '../tmp');
const PORT = process.env.PORT || 7005;


// https://www.gabrielcsapo.com/node-git-server/code/index.html
const repos = new GitServer(DIR, {
    autoCreate: true,
    authenticate: (type, repo, user, next) => {
      if(type == 'push') {
        user((username, password) => {
          // [TODO] user authentication
          console.log(username, password);
          next();
        });
      } else {
        next();
      }
    }
});

repos.on('push', (push) => {
    if (push.branch == 'master') {

        var data = {
          {
            'data': {
              'repo': push.repo,
              'commit': push.commit,
              'branch': push.branch
            },
            'output(message:string)': null
          }
        };

        app.get(data, function(res){
          push.accept();
          engine.run(data);
        });

    } else {
        push.reject();
    }
});

repos.on('fetch', (fetch) => { fetch.reject(); });

repos.on('tag', (tag) => { tag.reject(); });

repos.listen(PORT, () => {
    console.log(`node-git-server running at http://localhost:${PORT}`)
});
