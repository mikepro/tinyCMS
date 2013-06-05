var mongo = require('mongodb');

function BrandRepository() {

  var db;

  mongo.MongoClient.connect("mongodb://localhost:27017/tinyCMS", function(err, database) {
    if (err) {
      console.log(err);
    }
    db = database;
  });

  this.list = function(res) {
    db.collection('brands', function(err, collection) {
      collection.aggregate(
        { $group : {
          _id: { brandCode: "$brandCode", brandName: "$brandName"}
        }
        } ,
        { $project : {
          _id : 0,
          brandCode : "$_id.brandCode",
          brandName: "$_id.brandName", lower: { $toLower: "$_id.brandName" } }},
        { $sort: { lower : 1 }}
        ,function (error, result) {
          res.json(result);
        }
      );
    });
  };
}

module.exports = new BrandRepository();