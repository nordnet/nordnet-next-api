var api = require('./../../../lib/');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  api.get('https://api.test.nordnet.se/next/2').then(function(response) {
    res.send(response);
  })
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});