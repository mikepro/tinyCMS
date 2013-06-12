var TextItem = function(value) {
  this.text = ko.observable(value);
};

var BrandViewModel = function(brandData) {
  var self = this;

  self.isDisplayMode = ko.observable(true);
  self.brandRecords = ko.observableArray([]);

  self.selectedRecord = ko.observable();
  self.editedRecord = ko.observable();

  self.createBrandRecordViewModel = function(singleBrandRecord) {
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

    return js;
  };

  self.selectBrandRecord = function(brandRecord) {
    self.selectedRecord(brandRecord);
  };

  self.edit = function () {
    self.isDisplayMode(false);

    var existingUnpublished = ko.utils.arrayFirst(self.brandRecords(), function(item) {
      return item.status() == 'unpublished';
    });

    var brandRecord;
    if (existingUnpublished) {
      brandRecord = self.serialiseBrand(existingUnpublished);
    } else {
      brandRecord = self.serialiseBrand(self.selectedRecord());
      delete brandRecord._id;
      brandRecord.status = 'unpublished';
    }

    self.editedRecord(self.createBrandRecordViewModel(brandRecord));
  };

  self.saveEditing = function() {

    var existingUnpublished = ko.utils.arrayFirst(self.brandRecords(), function(item) {
      return item.status() == 'unpublished';
    });

    if (existingUnpublished) {
      var index = self.brandRecords().indexOf(existingUnpublished);
      self.brandRecords()[index] = self.editedRecord();
    } else {
      self.brandRecords.push(self.editedRecord());
    }

    //TODO: Confirm success
    $.post('/brands/save', self.serialiseBrand(self.editedRecord()))
      .done(function(data) {
        if (data) {
          self.editedRecord()._id = data;
        }
        self.selectedRecord(self.editedRecord());
        self.editedRecord(null);
        self.isDisplayMode(true);
      })
      .fail(function(message) {
        viewModel.errorMessage('There was a problem saving your changes: ' + message);
        $('#alertModal').modal('show');
      });
  };

  self.cancelEditing = function() {
    self.editedRecord(null);
    self.isDisplayMode(true);
  };

  $.each(brandData, function(index, brandRecord) {
    self.brandRecords.push(self.createBrandRecordViewModel(brandRecord))
  });

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
