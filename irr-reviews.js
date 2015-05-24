var Cohen = require('./lib/cohens_kappa');
var retrieve = require('./retrieve_tomatoes_reviews');
var Q = require('q');

/* Originally returns: 
* Peter Travers agreement:0.88
* Pauline Kael agreement:0.57
* Dave Kehr agreement:0.82
*/

// fake professional reviewer list, for use in testing: 
var reviewers = {'Peter Travers': 
  {'Rambo': 5, 
    'Point Break': 3, 
    'Speed': 2, 
    'Aliens': 5,
    'Red Dawn': 3, 
    'The Big Lebowski': 5,
    'Videodrome': 4,
    'John Wick': 2,
    'Zero Dark Thirty': 1,
    'All is Lost': 5,
    'Inside Llewyn Davis': 4,
    'Silver Linings Playbook': 3,
    'Predator': 4  
  }, 'Pauline Kael': 
    {'Point Break': 4,
      'Aliens': 5,
      'The Breakfast Club': 4,
      'Inherent Vice': 4,
      'Red Dawn': 3,
      'The Big Lebowski': 5,
      'Videodrome': 3,
      'John Wick': 1,
      'Zero Dark Thirty': 3,
      'All is Lost': 5,
      'Inside Llewyn Davis': 4,
      'Silver Linings Playbook': 3
     },
  'Dave Kehr':
  {'Point Break': 3,
    'Speed': 2, 
    'Aliens': 5,
    'Red Dawn': 3, 
    'The Big Lebowski': 5,
    'Videodrome': 4,
    'John Wick': 2,
    'Zero Dark Thirty': 1,
    'All is Lost': 5,
    'Inside Llewyn Davis': 4
   }
};

// Sample user ratings. Not me. 
var user = {
  'The Terminator': 5, 
  'Predator': 4,
  'Point Break': 3,
  'Speed': 3, 
  'Aliens': 5,
  'The Breakfast Club': 5,
  'Inherent Vice': 4,
  'Red Dawn': 2,
  'The Big Lebowski': 5,
  'Videodrome': 4,
  'John Wick': 2,
  'Zero Dark Thirty': 1,
  'All is Lost': 5,
  'Inside Llewyn Davis': 4,
  'Silver Linings Playbook': 3
};

var profReviews = {};

// The following creates a promise for each movie title in the user object and adds
// it to the searches array, each of which will later be called sequentially. These
// functions take in a search term (movie title) and add the professional reviews
// for that movie to profReviews. 
var titles = Object.keys(user);
var searches = [];
titles.forEach(function(title) {
  var search = function() {
    return retrieve.getSearchResult(title)
    .then(function(searchResult){ return retrieve.getReviewLink(searchResult)})
    .then(function(reviewLink){ return retrieve.reviewsFromReviewLink(reviewLink)})
    .then(function(reviewArray) {
      retrieve.parseReviewArray(title, reviewArray, profReviews, true);
    }).catch(function(error) {
      console.log(error);
    });
  };
  searches.push(search);
});

//Create the function to be called after profReviews has been populated, then add
//it to the stack.
var showResults = function() {
  //*
  try{
  compare(user, profReviews);
  }catch(e) {
    console.log(e);
  }
}

searches.push(showResults);

//Serialize the function calls for each movie in turn. This is necessary to avoid
//exceeding Rotten Tom's request limit (5/s). This forEach is what finally does the
//work. 
var result = Q(1);
searches.forEach(function(f) {
  result = result.then(f);
});



// Utility function that returns array of reviews for single film.
function getReviews(searchTerm) {
  return retrieve.getSearchResult(searchTerm)
  .then(function(searchResult){ return retrieve.getReviewLink(searchResult)})
  .then(function(reviewLink){ return retrieve.reviewsFromReviewLink(reviewLink)})
  .then(function(reviewArray){
    console.log(reviewArray);
  }, function(error){
    console.log(error);
  }).catch(function(err){
    console.log(err);
  });
}

// Calls CKJS and gets scores for all reviewers, prints them out. 
function compare(userReviews, reviewerObject) {
  var results = [];
  for (reviewer in reviewerObject) {
    if (reviewerObject.hasOwnProperty(reviewer)) {
      var reviews = reviewerObject[reviewer];
      var k = Cohen.kappa(user, reviews, 5, 'linear');
      console.log(reviewer + " agreement:" + k);
      
    }
  };
}
 












