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
    "SupportCopy": "To buy on the phone please make sure you have your reference number and payment details handy and don't forget to mention that you received this quote from <strong>compare</strong>the<strong>market</strong>.com.",
  },
  "offer": {
    "terms": "A separate policy will be set up to provide Home Emergency Assistance.  First 3 months free, &pound;6 per month thereafter payable by monthly direct debit only.",
    "text": "Home Emergency Assistance FREE for the first 3 months",
  }
}

var viewModel = ko.mapping.fromJS(testData);

ko.applyBindings(viewModel);