var express = require('express');
var repository = require('./lib/brandRepository');

var app = express();
app.get('/brands/list.json',function(req, res) {
  repository.list(res);
});
app.use(express.static(__dirname +'/content'));
app.listen(8022);
