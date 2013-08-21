var TextItem = function(value) {
  this.text = ko.observable(value);
};

var BrandViewModel = function(brandData) {
  var self = this;

  self.isDisplayMode = ko.observable(true);
  self.brandRecords = ko.observableArray([]);

  self.selectedRecord = ko.observable();
  self.editedRecord = ko.observable();

  self.code = ko.observable(brandData.code);
  self.recordDescriptor = {id: brandData._id, version: brandData.version};

  self.createBrandRecordViewModel = function(singleBrandRecord, status) {
    var model = ko.mapping.fromJS(singleBrandRecord, {
      'Benefits': {
        create: function(options) {
          return new TextItem(options.data);
        }
      },
      'importantText': {
        create: function(options) {
          return new TextItem(options.data);
        }
      }
    });

    model.removeBenefit = function(benefit) {
      this.Benefits.remove(benefit);
    };

    model.removeImportantText = function(importantText) {
      this.importantText.remove(importantText);
    };

    model.addBenefit = function() {
      this.Benefits.push(new TextItem());
    };

    model.addImportantText = function() {
      this.importantText.push(new TextItem());
    };

    model.status = ko.observable(status);

    return model;
  };

  self.serialiseBrand = function(brandViewModel) {
    function flattenTextNodes(object, propertyName) {
      object[propertyName] = ko.utils.arrayMap(object[propertyName], function(item){
        return item.text;
      });
    }

    var js = ko.mapping.toJS(brandViewModel);

    flattenTextNodes(js, "Benefits");
    flattenTextNodes(js, "importantText");
    delete js.status;

    return js;
  };

  self.selectBrandRecord = function(brandRecord) {
    self.selectedRecord(brandRecord);
  };

  self.edit = function () {
    self.isDisplayMode(false);

    var existingDraft = getBrandRecordByStatus('draft');

    var brandRecord;
    if (existingDraft) {
      brandRecord = self.serialiseBrand(existingDraft);
    } else {
      brandRecord = self.serialiseBrand(self.selectedRecord());
      delete brandRecord.updated;
      delete brandRecord.created;
    }

    self.editedRecord(self.createBrandRecordViewModel(brandRecord));
  };

  self.publish = function() {
    if (window.confirm('Are you sure you want to make all changes public?')) {
      var selected = self.selectedRecord();
      $.post('/brands/publish',self.recordDescriptor)
        .done(function(data) {
          var existingPublished = getBrandRecordByStatus('published');
          if (existingPublished) {
            self.brandRecords.remove(existingPublished);
          }
          selected.status('published');
          self.recordDescriptor.version = data.version;
        });
    }
  };

  function getBrandRecordByStatus(status) {
    return ko.utils.arrayFirst(self.brandRecords(), function (item) {
      return item.status() == status;
    });
  }

  self.saveEditing = function() {
    var existingUnpublished = getBrandRecordByStatus('draft');
    if (existingUnpublished) {
      var index = self.brandRecords().indexOf(existingUnpublished);
      self.brandRecords()[index] = self.editedRecord();
    } else {
      self.brandRecords.push(self.editedRecord());
    }

    //TODO: Confirm success
    $.post('/brands/save', { descriptor: self.recordDescriptor, data: self.serialiseBrand(self.editedRecord())})
      .done(function(data) {
        if (data && data.version) {
          self.recordDescriptor.version = data.version;
        }

        self.editedRecord().status("draft");

        self.selectedRecord(self.editedRecord());
        self.editedRecord(null);
        self.isDisplayMode(true);
      })
      .fail(function(message) {
        tinyCmsViewModel.errorMessage('There was a problem saving your changes: ' + message.err);
        $('#alertModal').modal('show');
      });
  };

  self.cancelEditing = function() {
    self.editedRecord(null);
    self.isDisplayMode(true);
  };

  if (brandData.published) {
    self.brandRecords.push(
      self.createBrandRecordViewModel(brandData.published, 'published')
    );
  }

  if (brandData.draft) {
    self.brandRecords.push(
      self.createBrandRecordViewModel(brandData.draft, 'draft')
    );
  }

  self.selectBrandRecord(self.brandRecords()[0]);
};

var tinyCmsViewModel = {

  errorMessage: ko.observable(),

  allBrands: ko.observableArray([]),
  selectedBrandListItem: ko.observable(),

  selectedBrand: ko.observable(),

  navigateHome: function() {
    if (this.selectedBrand() && this.selectedBrand().isDisplayMode()) {
      this.selectedBrand(null);
      this.selectedBrandListItem(null);
    }
  },

  populateBrand : function(data) {
    this.selectedBrand(new BrandViewModel(data));
  },

  selectBrand: function(brand) {
    var viewModel = this;
    $.getJSON('/brands/get.json',{code: brand.brandCode})
      .done(function(data) {
        viewModel.selectedBrandListItem(brand);
        viewModel.populateBrand(data);
        $(window).scrollTop(0);
      })
      .fail(function() {
        viewModel.errorMessage('There was a problem getting the brand data for: ' + brand.brandName);
        viewModel.selectedBrandListItem(null);
        $('#alertModal').modal('show');
      });
  }
};

$.getJSON('/brands/list.json',function(data) {
  tinyCmsViewModel.allBrands(data);
});

ko.applyBindings(tinyCmsViewModel);
