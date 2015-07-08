var Cohen = require('./lib/cohens_kappa');
var retrieve = require('./retrieve_tomatoes_reviews');
var Q = require('q');




// Sample user ratings. Not me. For testing/debugging.
var sample_user = {
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



module.exports = function(user) {

  // this defer will resolve/reject way at the bottom of this outer function,
  // inside of showResults.

  // Sets up a promise for the exported function to return. The promise gets
  // resolved inside of showResults(), the last inner function executed. 
  var def = Q.defer();
  var profReviews = {};
  
  // The following creates a function for each title in the user's reviews, which
  // will get the reviews for that title. The functions are pushed onto the searches
  // stack, which will be called sequentially down below after showResults() has been
  // added to that stack as well. 
  //
  // Note that parseReviewArray will not return the same values every time it is
  // called for reviews that use scores that are less fine-grained than a 5-point
  // scale. 
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
        console.log(title + ": " + error);
      });
    };
    searches.push(search);
  });
  
  //Create the function to be called after profReviews has been populated, then add
  //it to the stack.
  var showResults = function() {
    var comparisons = compare(user, profReviews);
    def.resolve(comparisons);
  };
  
  searches.push(showResults);
  
  //Serialize the function calls for each movie in turn. This is necessary to avoid
  //exceeding Rotten Tom's request limit (5/s). This forEach is what finally does the
  //work. 
  var result = Q(1);
  searches.forEach(function(f) {
    result = result.then(f);
  });
  
  // This is the promise created at the beginning of the exported function. 
  return def.promise;
  
  // Calls CKJS and gets scores for all reviewers. Then, creates a new objects for
  // each reviewer and score, pushes them onto an array, filters out the ones that
  // return too-few-reviews errors (any that aren't numbers for kappa), sorts them in
  // descending order, and returns the top 5. 
  function compare(userReviews, reviewerObject) {
    var results = [];
    for (var reviewer in reviewerObject) {
      if (reviewerObject.hasOwnProperty(reviewer)) {
        var reviews = reviewerObject[reviewer];
        var k = Cohen.kappa(user, reviews, 5, 'linear');
        var numReviews = Object.keys(reviews).length;
  
        //console.log(reviewer + ": " + JSON.stringify(reviews));
  
        var agreement = {'reviewer': reviewer, 'kappa': k, 'numReviews': numReviews};
        results.push(agreement);
      }
    }
    //console.log("In irr, in compare: " + results);
    var returnVal = results.filter(function(rev) {
      return typeof rev['kappa'] === 'number';
        }).sort(function(a,b) {
          return b['kappa'] - a['kappa'];
        });
    //console.log(returnVal.slice(0,5));
    return returnVal.slice(0,5); // returns the top five agreements;
  }

};

// Utility function that returns array of reviews for single film.
function getReviews(searchTerm) {
  return retrieve.getSearchResult(searchTerm)
  .then(function(searchResult){ return retrieve.getReviewLink(searchResult);})
  .then(function(reviewLink){ return retrieve.reviewsFromReviewLink(reviewLink);})
  .then(function(reviewArray){
    console.log(reviewArray);
  }, function(error){
    console.log(error);
  }).catch(function(err){
    console.log(err);
  });
}













