var mongo = require('mongodb');

function BrandRepository() {

  var db;

  var mongoConnection = process.argv[2] || "mongodb://127.0.0.1/tinyCMS";
  mongo.MongoClient.connect(mongoConnection, function(err, database) {
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

      collection.aggregate([
        { $project : {
          brandCode: "$code",
          brandName: { $ifNull: ["$draft.brandName", "$published.brandName"] },
          draft : { $cond: [ { $eq : ["$draft", null]}, false, true ]}
        }},
        { $project: {
          brandCode: 1,
          brandName :1,
          lower: { $toLower: "$brandName"},
          draft: 1
        }},
        { $sort: { lower : 1 } }]
      ,
        function (error, result) {
          if (error) {
            res.send(500, error);
	    console.log("bob");
            return;
          }
          res.json(result);
        }
      );
    });
  };

  this.published = function(res) {
    db.collection('brands').aggregate(
      { $match : {published: {$ne: null}}},
      { $project: {
        brandCode: "$code",
        data: "$published"
      }}
      , function (error, docs) {
        if (error) {
          res.send(500, error);
          return;
        }

        res.json(docs);
    });
  };

  this.drafts = function(res) {
    db.collection('brands').aggregate(
      {$project: {
        brandCode: "$code",
        data: {$ifNull: ["$draft","$published"]}
      }}
      , function (error, docs) {
        if (error) {
          res.send(500, error);
          return;
        }

        res.json(docs);
    });
  };

  this.get = function(brandCode, res) {
    db.collection('brands').findOne({code:brandCode}, function (error, item) {
        if (error) {
          res.send(500, error);
          return;
        }

        if (!item) {
          res.send(404, {msg: "Brand with code " + brandCode + " not found"});
        } else {
          res.json(item);
        }
    });
  };

  this.save = function(brandDocument, res) {

    var newDraft = brandDocument.data;

    var changeInfo = {date: new Date(), user: "TODO"};

    if (newDraft.created) {
      newDraft.updated = changeInfo;
    } else {
      newDraft.created = changeInfo;
    }

    console.log(brandDocument.descriptor);
    var id = mongo.ObjectID(brandDocument.descriptor.id);

    //TODO: detect conflict (server version ahead)

    var newVersion = (+brandDocument.descriptor.version) + 1;
    db.collection('brands').update(
      {_id: id},
      { $set: {
          "draft" : brandDocument.data,
          "version" : newVersion
        }
      }
      , function(error, updateCount) {
        if (error) {
          res.send(500, error);
          return;
        }
        if (updateCount == 1) {
          //TODO: Send back "created" date when new draft is created
          res.send(200, {msg: "Updated", version:  newVersion});
        }
      }
    );
  };

  this.publish = function(data, res) {
    var id = mongo.ObjectID(data.id);

    db.collection('brands', function (error, collection) {

      if (error) {
        res.send(500, error);
        return;
      }

      collection.findOne({"_id" : id}, function (err, item) {
        if (item.version != data.version) {
          res.send(409, {"msg" : "Version mismatch " + item.version + " <> " + data.version });
          return;
        }

        var newVersion = (+item.version) + 1;

        collection.update({"_id" : id},
          { $set : {
            draft: null,
            published: item.draft
          }},
          function (error, item) {
            if (error) {
              res.send(500, error);
              return;
            }
            res.send(200, {msg: "Updated", version: newVersion})
          });
      });
    });
  };
}

module.exports = new BrandRepository();
