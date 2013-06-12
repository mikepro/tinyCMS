var express = require('express');
var repository = require('./lib/brandRepository');

var app = express();
app.use(express.bodyParser());

app.get('/brands/list.json',function(req, res) {
  repository.list(res);
});

app.get('/brands/get.json', function(req, res) {
  if (req.query.code) {
    repository.get(req.query.code, res);
  } else {
    res.send(400, {error:'A query parameter "code" is required'});
  }
});

app.post('/brands/save', function(req, res) {
  repository.save(req.body, res);
});

app.get('/brands/published.json', function(req, res) {
  repository.published(res);
});

app.use(express.static(__dirname +'/content'));
app.listen(8022);
