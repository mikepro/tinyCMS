
var fs = require('fs');

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

brands.Brands.forEach(function(brandData) {
  var brand = CleanupBrandData(brandData);
  console.log(" * " + brand.brandCode);
});
