var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); //tells express to encode the URL

function isNonNegInt(queryString, returnErrors = false){
    errors = []; // assume no errors at first
        if(Number(queryString) != queryString) {
         errors.push('Not a number!'); // Check if string is a number value
        } else {
        if(queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer
        }

    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else { 
        return false;
    }
}

app.get('/test', function (request, response, next) {
    console.log("Got a test path"); //can only send one response to a request
    next(); //used to match multiple rules, can't send a response on the first line
});

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});
app.post("/process_form", function (request, response) {
    var q = request.body['quantity_textbox'];
    if (typeof q != 'undefined') {
        if (isNonNegInt(q)) {
    response.send(`Thank you for purchasing ${q} things!`); //if it finds that in the request body, print the string
    } else {
        response.send(`${q} is not a valid quantity - hit the back button`);
    }
}

 });
 
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback
