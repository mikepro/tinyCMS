
var fs = require('fs'),
    mongo = require('mongodb');

console.log("Importing data");

var data = fs.readFileSync('brands.json');
var brands = JSON.parse(data);

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

mongo.MongoClient.connect("mongodb://localhost:27017/tinyCMS", function(err, db) {
  if(!err) {
    console.log("We are connected");
  }

  db.createCollection('brands', function(err, collection) {
    if (err) {
      console.log(err);
    }

    var i = 0;

    collection.createIndex({brandCode:1, status:1}, {unique:true, w:1}, function(error, indexName) {
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
