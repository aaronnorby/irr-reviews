var Cohen = require('./lib/cohens_kappa');
var retrieve = require('./retrieve_tomatoes_reviews');
var Q = require('q');

/*
var user = {'Terminator': 5, 'Speed': 3, 'Aliens': 5, 'Point Break': 2, 'Red Dawn': 2, 'Blond on Blond': 1};
var reviewer = {'Terminator': 4, 'Speed': 2, 'Aliens': 5, 'Point Break': 3, 'Red Dawn': 3, 'Blond on Blond': 4};
*/


// fake professional reviewer list: 
var reviewers = {'Peter Travers': 
  {'Rambo': 5, 
    'Point Break': 3, 
    'Speed': 2, 
    'Aliens': 5,
    'Red Dawn': 3, 
    'Blond on Blond': 4
  }, 'Pauline Kael': 
    {'Point Break': 4,
      'Aliens': 5,
      'Red Dawn': 2,
      'Blond on Blond': 1
     },
  'Dave Kehr':
  {'Point Break': 3,
   }
  };

// Sample user ratings. Not me. 
var user = {
  'Terminator': 5, 
  'Speed': 3, 
  'Aliens': 5, 
  'Point Break': 2, 
  'Red Dawn': 2, 
  'Blond on Blond': 1};




// This chain adds Terminator reviews to the list and calculates kappas.  
return retrieve.getSearchResult("The Terminator")
.then(function(searchResult) {return retrieve.getReviewLink(searchResult)})
.then(function(reviewLink) {return retrieve.reviewsFromReviewLink(reviewLink)})
.then(function(reviewArray) {
    reviewers = retrieve.parseReviewArray("The Terminator", reviewArray, reviewers, true);
    compare(user, reviewers);
  }, function(error) {
    console.log(error)
}).catch(function(error) {
    console.log(error);
});


// Calls CKJS and gets scores for all reviewers, prints them out. 
function compare(user, reviewerObject) {
  var results = [];
  for (reviewer in reviewers) {
    if (reviewerObject.hasOwnProperty(reviewer)) {
      var reviews = reviewers[reviewer];
      var k = Cohen.kappa(user, reviews, 5, 'linear');
      console.log(reviewer + " agreement:" + k);
    }
  };
}
 












