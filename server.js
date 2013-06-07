var express = require('express');
var repository = require('./lib/brandRepository');

var app = express();
app.get('/brands/list.json',function(req, res) {
  repository.list(res);
});

app.get('/brands/get.json', function(req, res) {
  console.log(req.param.code)
});

app.use(express.static(__dirname +'/content'));
app.listen(8022);
