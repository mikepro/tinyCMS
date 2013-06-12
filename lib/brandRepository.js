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
    db.collection('brands', function(error, collection) {
      if (error) {
        res.send(500, error);
        return;
      }
      collection.aggregate(
        { $group : {
          _id: { brandCode: "$brandCode"},
          brandName: { $first : "$brandName"}
          }
        } ,
        { $project : {
          _id : 0,
          brandCode: "$_id.brandCode",
          brandName: "$brandName",
          lower: { $toLower: "$brandName" }
          }
        },
        { $sort: { lower : 1 }}
        ,function (error, result) {
          if (error) {
            res.send(500, error);
            return;
          }
          res.json(result);
        }
      );
    });
  };

  this.published = function(res) {
    db.collection('brands').find({status:'published'}).toArray(function(error, docs) {
      if (error) {
        res.send(500, error);
        return;
      }

      res.json(docs);
    });
  }

  this.get = function(brandCode, res) {
    db.collection('brands').find({brandCode:brandCode}).toArray(function(error, docs) {
        if (error) {
          res.send(500, error);
          return;
        }

        if (!docs.length) {
          res.send(404);
        } else {
          res.json(docs);
        }
    });
  }

  this.save = function(brandDocument, res) {
    db.collection('brands').save(brandDocument, function(error, record) {
      if (error) {
        res.send(500, error);
        return;
      }
      if (record == '1') {
        //TODO: Correct HTTP code - updated
        res.send(200);
      } else {
        //TODO: Correct HTTP code - created
        res.send(200, record._id);
      }
    });
  }
}

module.exports = new BrandRepository();