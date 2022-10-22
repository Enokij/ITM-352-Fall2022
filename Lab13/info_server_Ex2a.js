var express = require('express');
var app = express();

app.get('/test', function (request, response, next) {
    console.log("Got a test path"); //can only send one response to a request
    next(); //used to match multiple rules, can't send a response on the first line
});

app.all('*', function (request, response, next) {
    response.send(request.method + ' to path ' + request.path);
});
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback
