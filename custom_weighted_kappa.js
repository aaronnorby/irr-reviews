// TODO: add output of number of movies compared (for when reviewer has not
// reviewed movies that the user has rated). 


// Assumption about format of data: 'user' and 'reviewer' should each be JSON objects
// with movie titles as keys and 1--5 ratings as values. Important that the ratings
// be typed as numbers. 

// Example user ratings: {'Terminator': 5, 'Speed': 3, 'Aliens': 5, 'Point Break': 2, 'Red Dawn': 2, 'Blond on Blond': 1};
// Example reviewer ratings: {'Terminator': 4, 'Speed': 2, 'Aliens': 5, 'Point Break': 3, 'Red Dawn': 3, 'Blond on Blond': 4}

function WeightedKappa() {
}; 

WeightedKappa.prototype.linear = function(user, reviewer) {
  // Make sure there are some reviews. A better way would be to calculate p-value. Also,
  // the function won't work with less than 2 reviews in reviewer. 
  if (Object.keys(reviewer).length < 2) return "Not enough reviews.";  

  // Builds size x size matrix filled with defaultValue.
  function squareMatrix(size, defaultValue) {
    var ary = new Array(size);
    for (var i = 0; i < size; i++) {
      ary[i] = [];
      for (var j = 0; j < size; j++) {
        ary[i].push(defaultValue);
      };
    };
    return ary;
  };

  var observed = squareMatrix(5, 0);
  var hypothetical = squareMatrix(5, 0);
  var weightMatrix = squareMatrix(5, 0);
  
  
  // Build the matrix of observed agreements/disagreements
  for (var movie in user) { 
    if (user.hasOwnProperty(movie) && reviewer.hasOwnProperty(movie)) {
      var userRating = user[movie] - 1;
      var reviewerRating = reviewer[movie] - 1;
      observed[userRating][reviewerRating] += 1;
    };
  };

  
  function userTotals(stars, obs) {
    stars = stars - 1;
    var starTotal = obs[stars].reduce(function(sum, n) { return sum + n; });
    return starTotal;
  };

  function revTotals(stars, obs) {
    stars = stars - 1;
    var count = 0;
    for (var i = 0; i < obs.length; i++) {
      count += obs[i][stars];
    };
    return count;
  };

  var totalReviews = 0;
  for (stars = 1; stars < 6; stars++) {
    totalReviews += userTotals(stars, observed);
  };
  
  

  // Build matrix of hypothetical agreements/disagreements by chance 
  for (var i = 0; i < observed.length; i++) {
    var row = observed[i];
    for (var j = 0; j < observed[i].length; j++) {
      hypothetical[i][j] = (userTotals(i+1, observed)/totalReviews) *
        (revTotals(j+1, observed)/totalReviews);
    };
  };
    
  

  // Build weight matrix. Remember that the categories must start at 1, not 0, to compute
  // distances accurately. So add 1 to indexes to get category numbers. (Ie, index
  // 0 is for the count of 1-star agreements.) 
  for (i = 0; i < weightMatrix.length; i++) {
    for (j = 0; j < weightMatrix.length; j++) {
      weightMatrix[i][j] = Math.abs((i+1) - (j+1));
    };
  };
  
  // Computes Kappa from observed, hyp, and weights. 
  function kappa() {
    var numerator = 0;
    for (var i = 0; i<observed.length; i++) {
      for (var j = 0; j<observed.length; j++) {
        numerator += observed[i][j] * weightMatrix[i][j];
      };
    };
    var denominator = 0;
    for (var i = 0; i < hypothetical.length; i++) {
      for (var j = 0; j < hypothetical.length; j++) {
        denominator += hypothetical[i][j] * totalReviews * weightMatrix[i][j];
      };
    };
    return 1 - (numerator / denominator);
  };
        
  //return observed, rounded to 2 dec places;
  return Math.round(kappa()*100) / 100; 

}



WeightedKappa.prototype.squared = function(user, reviewer) {
  function squareMatrix(size, defaultValue) {
    var ary = new Array(size);
    for (var i = 0; i < size; i++) {
      ary[i] = [];
      for (var j = 0; j < size; j++) {
        ary[i].push(defaultValue);
      };
    };
    return ary;
  };

  var observed = squareMatrix(5, 0);
  var hypothetical = squareMatrix(5, 0);
  var weightMatrix = squareMatrix(5, 0);
  
  
  // Build the matrix of observed agreements/disagreements
  for (var movie in user) { 
    if (user.hasOwnProperty(movie) && reviewer.hasOwnProperty(movie)) {
      var userRating = user[movie] - 1;
      var reviewerRating = reviewer[movie] - 1;
      observed[userRating][reviewerRating] += 1;
    };
  };

  
  function userTotals(stars, obs) {
    stars = stars - 1;
    var starTotal = obs[stars].reduce(function(sum, n) { return sum + n; });
    return starTotal;
  };

  function revTotals(stars, obs) {
    stars = stars - 1;
    var count = 0;
    for (var i = 0; i < obs.length; i++) {
      count += obs[i][stars];
    };
    return count;
  };

  var totalReviews = 0;
  for (stars = 1; stars < 6; stars++) {
    totalReviews += userTotals(stars, observed);
  };
  
  

  // Build matrix of hypothetical agreements/disagreements by chance 
  for (var i = 0; i < observed.length; i++) {
    var row = observed[i];
    for (var j = 0; j < observed[i].length; j++) {
      hypothetical[i][j] = (userTotals(i+1, observed)/totalReviews) *
        (revTotals(j+1, observed)/totalReviews);
    };
  };
    
  

  // Build weight matrix. Remember that the categories must start at 1, not 0, to compute
  // distances accurately. So add 1 to indexes to get category numbers. (Ie, index
  // 0 is for the count of 1-star agreements.) 
  for (i = 0; i < weightMatrix.length; i++) {
    for (j = 0; j < weightMatrix.length; j++) {
      weightMatrix[i][j] = Math.pow((Math.abs((i+1) - (j+1))), 2);
    };
  };
  
  // Computes Kappa from observed, hyp, and weights. 
  function kappa() {
    var numerator = 0;
    for (var i = 0; i<observed.length; i++) {
      for (var j = 0; j<observed.length; j++) {
        numerator += observed[i][j] * weightMatrix[i][j];
      };
    };
    var denominator = 0;
    for (var i = 0; i < hypothetical.length; i++) {
      for (var j = 0; j < hypothetical.length; j++) {
        denominator += hypothetical[i][j] * totalReviews * weightMatrix[i][j];
      };
    };
    return 1 - (numerator / denominator);
  };
        
  //return observed, rounded to 2 dec places;
  return Math.round(kappa()*100) / 100; 

}



var kappa = new WeightedKappa();
module.exports = kappa;


