

var http = require("http"); 
var Q = require("q");

function RetrieveTomato() {
}

var baseUrl = "http://api.rottentomatoes.com/api/public/v1.0/movies.json";
var apikey = "my-API-key";

/*
 * Not all reviewers have numeric ratings, some just have
 * freshness "fresh" or "rotten". The ones that have reviews have the property
 * "original_score", which could be anything out of anything. Has to be normalized,   
 * which is done in parseReviewArray. 
*/

RetrieveTomato.prototype.search = function(searchTerm) {
  var searchStr = encodeURI(searchTerm);
  var path = baseUrl + "?apikey=" + apikey + "&q=" + searchStr;
  var request = http.get(path, function(response) {
    var data = "";
    response.on("data", function(chunk) {
      data += chunk;
    });
    response.on("end", function() {
      var result = JSON.parse(data);
      return result;   
    });
    response.on("error", function(err) {
      console.log("Error: " + err);
    });
  });
  
};

RetrieveTomato.prototype.getReviewLink = function(searchResult) {
  var def = Q.defer();
  var movieLink = searchResult.movies[0].links["self"];  // Problem: assumes first movie in array is the right one. 
  var path = movieLink + "?apikey=" + apikey;

  var request = http.get(path, function(response) {
    var data = "";

    response.on("data", function(chunk) {
      data += chunk;
    });

    response.on("end", function() {
      var movieData = JSON.parse(data);
      var reviewLink = movieData.links.reviews;
      def.resolve(reviewLink);
    });

    response.on("error", function(err) {
      def.reject(new Error("getReviewLink Error: " + err));
    });
  });

  return def.promise;

};

RetrieveTomato.prototype.reviewsFromReviewLink = function(reviewLink) {
  var def = Q.defer();
  var path = reviewLink + "?apikey=" + apikey;

  var request = http.get(path, function(res) {
    var data = "";

    res.on("data", function(chunk) {
      data += chunk;
    });

    res.on("end", function() {
      var reviewData = JSON.parse(data);
      var reviewArray = reviewData.reviews;
      def.resolve(reviewArray); 
    });

    res.on("error", function(err) {
      def.reject(new Error("Revs from Link Error: " + err));
    });
  });

  return def.promise;
};

// Takes preexisting reviewerList object and the reivewArray for a given movie, and
// then adds reviews to the reviewerList, creating a new subobject for any critics
// not already in there. Assumes externally held reviewerList. 
RetrieveTomato.prototype.parseReviewArray = function(movie, reviewArray, reviewerList, freshnessToScore) {
  freshnessToScore = freshnessToScore || false;
  for (var rev = 0; rev < reviewArray.length; rev++) {
    var reviewObject = reviewArray[rev];
    var critic = reviewObject.critic;
    var score;

    if (critic === "") continue;  // Could also use publication as critic name. 

    if (reviewObject["original_score"] !== undefined) {
      score = normalizeScore(reviewObject.original_score);
    } else if (freshnessToScore && reviewObject["freshness"] !== undefined) {
      score = normalizeScore(freshscore(reviewObject.freshness));
    }

    if (reviewerList[critic] !== undefined) {
      reviewerList[critic][movie] = score;
    } else {
      reviewerList[critic] = {};
      reviewerList[critic][movie] = score;
    } 
    
  }
  
  return reviewerList; 

  // Convert freshness to numerical score.
  function freshscore(fresh) {
    var score;
    if (fresh == "fresh") {
      score = "2/2";
    } else if (fresh == "rotten") {
      score = "1/2";
    } 
    return score;
  }

  // Normalize scores to 1-5 scale. 
  function normalizeScore(score) {
    try { 
      //Get the two halves of the score. This regex may not be perfect. 
      var scoreParts = score.split("/");
      var dividend = parseFloat(scoreParts[0], 10);
      var divisor = parseFloat(scoreParts[1], 10);
      var newScore;

      // TODO: add check that neither is NaN after parseFloat(); Also,
      // normalizeScore is leaving some scores with "/" in them, which returns NaN
      // with kappa.

      if (dividend === 0) {
        dividend += 1;
        divisor += 1;
      }

      if (divisor == 5) {
        return dividend;

      } else if (dividend < 5) {
        var breaks = 5 / divisor; // Determine size of bins in 5-star units
        var lowerBound = breaks * (dividend - 1); // Which bins the score could be in.

        // Assign to a 5-star bin randomly from the bins the score could be in.
        // Assumes, eg, a 2/2 could be anywhere in upper half of /5 scale. 
        var r = Math.random();
        newScore = Math.ceil((r*breaks) + lowerBound); 
        return newScore;

      } else if (dividend > 5) {
        newScore = Math.ceil((5 / divisor) * dividend);
        return newScore;
      }

    } catch(e) {
      console.log("Normalize error:" + e);
    } 
  }
    
};

RetrieveTomato.prototype.getSearchResult = function(searchTerm) {
  var deferred = Q.defer();

  // setTimout to throttle calls to Rotten Tom's api, which has 5 requests/s cap.
  setTimeout(function() {
  var searchStr = encodeURI(searchTerm);
  var path = baseUrl + "?apikey=" + apikey + "&q=" + searchStr;

  var request = http.get(path, function(response) {
    var data = "";

    response.on("data", function(chunk) {
      data += chunk;
    });

    response.on("end", function() {
      var result = JSON.parse(data);
      deferred.resolve(result);   
    });

    response.on("error", function(err) {
      deferred.reject(new Error("Search Error: " + err));
    });
  });
  }, 500);
  

  return deferred.promise;

};



var retriever = new RetrieveTomato();
module.exports = retriever; 



