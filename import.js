
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
  delete brandData.logoUrl;
  if (brandData.offlinePresence) {
    if (brandData.offlinePresence.OpeningTimes) {
      delete brandData.offlinePresence.OpeningTimes.Name;
    }
    delete brandData.offlinePresence.Name;
  }
  delete brandData.offer.Name;

  return brandData;
}

var db = (function() {
  var server = new mongo.Server(
    'localhost',
    27017,
    {auto_reconnect: true});
  return new mongo.Db('tinyCMS', server, {safe: true});
})();

brands.Brands.forEach(function(brandData) {

  var brand = CleanupBrandData(brandData);
  brand.status = "published";
  brand.createdAt = new Date();

  db.collection('brands').insert(brand, function(err, inserted) {
    if (err) {
      console.log(err);
    }
  });

  console.log(" * " + brand.brandCode);
});
