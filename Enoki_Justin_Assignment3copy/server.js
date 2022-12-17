var express = require('express'); // referenced from lab14 server lab
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');
var products_data = require('./products.json');

app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));


const crypto = require('crypto'); // used to encrypt password IR1
const algorithm = 'aes-256-cbc'; // defines the encryption algorithm
const key = 'asdfasdfasdfasdfasdfasdfasdfasdf'; // defines the key used in the algorithm, it is set so that each unique password has a specified encryption attached to it
const iv = 'asdfasdfasdfasdf'; // defines the initializing variable at its initial state, this is set instead of a randomByte method so that everytime you enter the same password, it will encyrpt as the same encrytion data. Used to match passwords when logging in

function encrypt(text) { // this function encrypts text such as passwords
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv); // defines the variable cipher to the encryption algorithm using the key and iv
    let encrypted = cipher.update(text); // updates the text with the encryption, basically encrypting the password
    encrypted = Buffer.concat([encrypted, cipher.final()]); // uses concatenation to link the series of text so that it may be output
    return encrypted.toString('hex'); // returns the encrypted password as a string so that it can be compared to the user input password
}

function nav_bar(this_product_key, products_data) {
    // This makes a navigation bar to other product pages
    for (let products_key in products_data) {
        if (products_key == this_product_key) continue;
    }
}

// routes all other GET requests to files in the public folder
app.use(express.static(__dirname + '/public'));

// gives the server access to the request packet
app.use(express.urlencoded({ extended: true }));


// creates the response for all requests
app.all('*', function (request, response, next) {
    if(typeof request.session.cart == 'undefined') { request.session.cart = {}; } 
    next();
});

app.get("/get_products_data", function (request, response) {
    response.json(products_data);
});

app.get("/add_to_cart", function (request, response) {
    var products_key = request.query['products_key']; // get the product key sent from the form post
    var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
    request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
    response.redirect('./cart.html');
});

app.get("/get_cart", function (request, response) {
    response.json(request.session.cart);
});




app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));