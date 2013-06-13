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
          _id: { brandCode: "$brandCode" },
          brandName: { $first : "$brandName" },
          count : { $sum: 1 }
          }
        },
        { $project : {
          _id : 0,
          brandCode: "$_id.brandCode",
          brandName: "$brandName",
          count : "$count",
          lower: { $toLower: "$brandName" }
          }
        },
        { $sort: { lower : 1 } },
        function (error, result) {
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
  };

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
  };

  this.save = function(brandDocument, res) {

    if (brandDocument._id) {
      brandDocument._id = mongo.ObjectID(brandDocument._id);
    }

    db.collection('brands').save(brandDocument, function(error, record) {
      if (error) {
        res.send(500, error);
        return;
      }
      if (record == '1') {
        res.send(200, "Updated");
      } else {
        res.send(201, record._id);
      }
    });
  };

  this.publish = function(data, res) {
    db.collection('brands').remove({brandCode: data.brandCode, status: 'published'}, function(error) {
      if (error) {
        res.send(500, error);
        return;
      }

      db.collection('brands').update(
        {_id: mongo.ObjectID(data.id)},
        {$set: {status:'published'}},
        function(error, count) {
          if (error) {
            res.send(500, error);
            return;
          }
          res.send(200);
        });
    });
  };
}

module.exports = new BrandRepository();