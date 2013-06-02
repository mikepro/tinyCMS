var connect = require('connect');

var app = connect().use(connect.static('content')).listen(8022);