"use strict";

var
  fs = require('fs'),
  request = require('request'),
  mongo = require('mongodb');


var processData = function (data) {

  var cleanupBrandData = function (brandData) {
    delete brandData.Name;

    brandData.Benefits = brandData.brandBenefits.Benefits;
    delete brandData.brandBenefits;

    delete brandData.features;
    delete brandData.LogoUrl;
    if (brandData.offlinePresence) {
      if (brandData.offlinePresence.OpeningTimes) {
        delete brandData.offlinePresence.OpeningTimes.Name;
      }
      delete brandData.offlinePresence.Name;
    }
    delete brandData.offer.Name;
  }

  var brands = JSON.parse(data);

  var mongoConnection = process.argv[3] || "mongodb://127.0.0.1/tinyCMS";

  mongo.MongoClient.connect(mongoConnection, function (err, db) {
    if (!err) {
      console.log("We are connected");
    }

    db.createCollection('brands', function (err, collection) {
      if (err) {
        console.log(err);
      }

      var i = 1;

      collection.createIndex({"code" : 1}, {"unique" : true}, function (error, indexName) {
        if (!err) {
          console.log('Index created: ' + indexName);
        }

        brands.Brands.forEach(function (brandData) {
          var code = brandData.Name;
          cleanupBrandData(brandData);

          brandData.created = {date: new Date(), user: 'import'};

          var brandDocument = {
            code: code,
            published: brandData,
            draft: null,
            version: 1
          };

          delete brandData.brandCode;

          collection.insert(brandDocument, function (err) {
            if (!err) {
              i = i + 1;
              process.stdout.write(brandDocument.code + ' (' + i + ') ');
              if (!(i % 10)) {
                process.stdout.write("\n");
              }
            } else {
              console.log(err.err);
            }
          });
        });
      });
    });
  });
};

console.log("Importing data");

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

