"use strict";

var
  fs = require('fs'),
  request = require('request');

var processData = function (data) {

  var brands = JSON.parse(data);

  brands.Brands.forEach(function (brand) {
    console.log(brand.Name + " - " + brand.LogoUrl);

    request({uri : brand.LogoUrl}).pipe(fs.createWriteStream("content/img/logos/" + brand.Name.toLowerCase() + ".png"));
  });

};

console.log("Importing logos");

var dataSource = process.argv[2] || "https://home.comparethemarket.com/brands";

var data;

if (/^https?:\/\//.test(dataSource)) {
  console.log("Loading data over the web from: " + dataSource);
  request({uri: dataSource}, function (err, response, body) {
    if (!err) {
      processData(body);
    }
  });
} else {
  console.log("Loading data from file: " + dataSource);
  data = fs.readFile('brands.json', function (err, data) {
    if (!err) {
      processData(data);
    }
  });
}

