var path = require('path');

var express = require('express');

var app = express();

const rootDir = path.join(__dirname, 'build');
app.use(express.static(rootDir));
app.get('/*splat', (req, res) => {
  res.sendFile('index.html', { root: rootDir });
});

app.set('port', process.env.PORT || 8080);

var server = app.listen(app.get('port'), function (error) {
  if (error) {
    throw error;
  }
  console.log('listening on port', server.address().port);
});
