var http = require("http"),
    ecstatic = require("ecstatic"),
    Q = require("q"),
    irr = require("./irr-reviews");

var fileserver = ecstatic({root: "./"});


http.createServer(function(request, response) {
  if (request.method == "POST") {
    returnAgreement(request, response);
  } else {
    fileserver(request, response);
  }
}).listen(8000);

console.log("Server running on port 8000");


// Assumes that what we get from the client is an array of objects, each with a
// 'title' and 'score' key. userfyData will turn this into a format that can be
// used by irr-reviews (ie, a single object whose keys are film titles and values
// are scores.  At some point we need to check that the scores <=5, >=1.
function userfyData(ratings) {
  var user = {};
  var len = ratings.length;
  for (var i=0; i<len; i++) {
    user[ratings[i]['title']] = Number(ratings[i]['score']);
  }
  return user;
}

function respond(request, response, stat, type, data) {
  response.writeHead(stat, {
    "Content-type": type || "text/plain"
  });
  response.end(data);
}
    

function returnAgreement(req, res) {
  var data = "";
  req.on("data", function(chunk) {
    data += chunk;
  });
  req.on("end", function() {
    var user = userfyData(JSON.parse(data));
    var resData = JSON.stringify(user);

    respondIrr(req, res, user);
  });
  req.on("error", function(err) {
    console.log("returnAgreement Err:" + err);
  });
}

// irr() returns a promise. When that promise fulfills, it will be an array of
// objects with the properties 'reviewer', 'kappa', and 'numReviews', whose values
// are the respective reviewer, the kappa statistic, and the number of reviews used
// in calculating k. 
function respondIrr(req, res, userRevs) {
  irr(userRevs).then(function(comparisons) {
    respond(req, res, 200, "application/json", JSON.stringify(comparisons));
  },
  function(err) {
    console.log("Error in respondIrr: " + err);
    respond(req, res, 500, null, err);
  }).catch(function(error) {
    console.log("Error in respondIrr, in catch: " + error);
    respond(req, res, 500, null, error);
  });
}




// Pointless stuff after here.     

function returnToSender(req, res) {
  res.writeHead(200, {
    "Content-type": "text/plain"
  });
  var data = "";
  req.on("data", function(chunk) {
    data += chunk;
  });
  req.on("end", function() {
    var result = JSON.parse(data);
    userfyData(result);
    var count = result.length;
    res.end(count.toString());

    //res.end(JSON.stringify(mutateData(result)));
  });
  req.on("error", function(err) {
    console.log(err);
  });
}




function mutateData(obj) {
  obj["score"] = Number(obj["score"]) + 1;  
  return obj;

}
        
  




