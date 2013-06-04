var testData = {
  "brandCode": "BI9M",
  "brandName": "Budget",
  "strapLine": "",
  "Benefits": ["All calls answered by an award winning UK customer service team – open 7 days a week", "Budget Insurance has protected almost 3 million customers for the last 20 years", "24 hour UK claims helpline", "Cover for storm or flood damage", "Contents insurance provides £500 cover for theft of cash or credit cards from your home", "Contents insurance provides £350 bicycle cover"],
  "importantText": ["BUDGET is a trading name of BISL Limited. Registered in England No 3231094. Registered Office: Pegasus House, Bakewell Road, Orton Southgate, Peterborough, PE2 6YS. BISL Limited is authorised and regulated by the Financial Services Authority.", "Your quote has been based on a number of assumptions. Please check your details with Budget before purchasing."],
  "onlinePurchaseSupported": true,
  "offlinePresence": {
    "OfflinePurchaseSupported": true,
    "OpeningTimes": {
      "Monday": "8.00am - 9.00pm",
      "Tuesday": "8.00am - 9.00pm",
      "Wednesday": "8.00am - 9.00pm",
      "Thursday": "8.00am - 9.00pm",
      "Friday": "8.00am - 9.00pm",
      "Saturday": "9.00am - 5.00pm",
      "Sunday": "10.00am - 4.00pm",
      "BankHoliday": "Closed",
      "Name": "OpeningTimes"
    },
    "PhoneNumber": "0844 412 2106",
    "SupportCopy": "To buy on the phone please make sure you have your reference number and payment details handy and don't forget to mention that you received this quote from <strong>compare</strong>the<strong>market</strong>.com."
  },
  "offer": {
    "terms": "A separate policy will be set up to provide Home Emergency Assistance.  First 3 months free, &pound;6 per month thereafter payable by monthly direct debit only.",
    "text": "Home Emergency Assistance FREE for the first 3 months"
  }
}

var testData2 = {
  "brandName": "Axa",
  "strapLine": "Home insurance cover from a household name you can trust.",
  "brandBenefits": {
    "Benefits": ["Up to £1million buildings cover & up to £85,000 contents cover", "Free garden cover when you take out buildings insurance", "New for Old replacement on your contents (excludes clothing and linen)", "Free legal advice with our exclusive helpline", "Dedicated UK claims handlers", "Manage your policy 24/7 from your secure online account"],
  },
  "importantText": ["AXA Insurance UK plc is registered in England and Wales registered number 078950 and authorised and regulated by the Financial Services Authority, FSA number 202312. Registered address is 5 Old Broad Street, London EC2N 1AD.", "Your quote has been based on a number of assumptions. Please check your details with AXA before purchasing."],
  "onlinePurchaseSupported": true,
  "offlinePresence": {
  "OfflinePurchaseSupported": false,
    "OpeningTimes": null,
    "PhoneNumber": null,
    "SupportCopy": null
  },
  "offer": {
    "terms": null,
    "text": null
  },
  "Name": "AXAH"
};

var TextItem = function(value) {
  this.text = ko.observable(value);
};

var tinyCmsViewModel = {

  selectedBrand: ko.observable(),
  editedBrand: ko.observable(),
  displayMode: ko.observable(true),

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
    this.selectedBrand(this.createBrandViewModel(data));
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
  }
};

tinyCmsViewModel.editPublished = function() {
  this.displayMode(false);
  this.editedBrand(this.createBrandViewModel(this.serialiseBrand(this.selectedBrand())));
};

tinyCmsViewModel.saveEditing = function() {
  this.selectedBrand(this.editedBrand());
  this.editedBrand(null);

  this.displayMode(true);
};

tinyCmsViewModel.cancelEditing = function() {
  this.editedBrand(null);
  this.displayMode(true);
};

tinyCmsViewModel.populateBrand(testData);

ko.applyBindings(tinyCmsViewModel);