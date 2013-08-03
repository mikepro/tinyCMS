
var fs = require('fs'),
    request = require('request'),
    mongo = require('mongodb');

console.log("Importing data");

var dataSource = process.argv[2] || "https://home.comparethemarket.com/brands";

var data;

if (/^https?:\/\//.test(dataSource)) {
  console.log("Loading data over the web from: " + dataSource);
  request({uri: dataSource}, function(err, response, body) {
    if (!err) {
      processData(body);
    }
  })
} else {
  console.log("Loading data from file: " + dataSource);
  data = fs.readFile('brands.json', function(err, data) {
    if (!err) {
      processData(data);
    }
  });
}

var processData = function(data) {

  function CleanupBrandData(brandData) {
    brandData.brandCode = brandData.Name;
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

    return brandData;
  }

  var brands = JSON.parse(data);

  mongo.MongoClient.connect("mongodb://localhost:27017/tinyCMS", function(err, db) {
    if(!err) {
      console.log("We are connected");
    }

    db.createCollection('brands', function(err, collection) {
      if (err) {
        console.log(err);
      }

      var i = 0;

      collection.createIndex({brandCode:1}, {unique:true, w:1}, function(error, indexName) {
        if (!err) {
          console.log('Index created: ' + indexName);
        }

        brands.Brands.forEach(function(brandData) {
          var brand = CleanupBrandData(brandData);
          brand.status = "published";
          brand.createdAt = new Date();

          collection.insert(brand, function(err, r) {
            if (!err) {
              console.log('*' + brand.brandCode + ' (' + i++ + ')');
            } else {
              console.log(err.err);
            }
          });
        });
      });
    });
  });
};
