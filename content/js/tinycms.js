var TextItem = function(value) {
  this.text = ko.observable(value);
};

var tinyCmsViewModel = {

  allBrands: ko.observableArray([]),
  errorMessage: ko.observable(),

  selectedBrandListItem: ko.observable(),
  selectedBrandRecord: ko.observable(),
  editedBrand: ko.observable(),
  IsDisplayMode: ko.observable(true),

  brandRecords : ko.observableArray([]),

  createBrandViewModel: function(data) {
    var model = ko.mapping.fromJS(data, {
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
  },

  populateBrand : function(data) {
    var model = this;
    model.brandRecords.removeAll();
    $.each(data, function(index, brandRecord) {
      model.brandRecords.push(model.createBrandViewModel(brandRecord))
    });

    this.selectedBrandRecord(this.brandRecords()[0]);
  },

  serialiseBrand: function(brandViewModel) {
    function flattenTextNodes(object, propertyName) {
      object[propertyName] = ko.utils.arrayMap(object[propertyName], function(item){
        return item.text;
      });
    }

    var js = ko.mapping.toJS(brandViewModel);

    flattenTextNodes(js, "Benefits");
    flattenTextNodes(js, "importantText")

    return js;
  },

  selectBrand: function(brand) {
    var viewModel = this;
    viewModel.selectedBrandListItem(brand);
    $.getJSON('/brands/get.json',{code: brand.brandCode})
      .done(function(data) {
        viewModel.populateBrand(data);
        $(window).scrollTop(0);
      })
      .fail(function() {
        viewModel.errorMessage('There was a problem getting the brand data for: ' + brand.brandName);
        $('#alertModal').modal('show');
      });
  },

  selectBrandRecord: function(brandRecord) {
    this.selectedBrandRecord(brandRecord);
  }
};

tinyCmsViewModel.editPublished = function() {
  this.IsDisplayMode(false);
  this.editedBrand(this.createBrandViewModel(this.serialiseBrand(this.selectedBrandRecord())));
};

tinyCmsViewModel.saveEditing = function() {
  this.selectedBrandRecord(this.editedBrand());
  this.editedBrand(null);

  this.IsDisplayMode(true);
};

tinyCmsViewModel.cancelEditing = function() {
  this.editedBrand(null);
  this.IsDisplayMode(true);
};

$.getJSON('/brands/list.json',function(data) {
  tinyCmsViewModel.allBrands(data);
});

ko.applyBindings(tinyCmsViewModel);
