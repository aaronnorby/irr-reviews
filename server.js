var http = require("http"),
    url  = require("url"),
    path = require("path"),
    fs = require("fs"),
    ecstatic = require("ecstatic");

var fileserver = ecstatic({root: "./"});


http.createServer(function(request, response) {
  if (request.method == "POST") {
    returnToSender(request, response);
  } else {
    fileserver(request, response);
  }
}).listen(8000);

console.log("Server running on port 8000");

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
  console.log(user);
  // return user;
}


function mutateData(obj) {
  obj["score"] = Number(obj["score"]) + 1;  
  return obj;

}
        
  




