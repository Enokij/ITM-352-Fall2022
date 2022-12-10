var express = require('express'); // referenced from lab14 server lab
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');
var products_data = require('./products.json');

app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));

var fs = require('fs');
var fname = "user_data.json"

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

/*
function nav_bar(this_product_key, products_data) {
    // This makes a navigation bar to other product pages
    for (let products_key in products_data) {
        if (products_key == this_product_key) continue;
    }
}
*/

// routes all other GET requests to files in the public folder
app.use(express.static(__dirname + '/public'));

// gives the server access to the request packet
app.use(express.urlencoded({ extended: true }));

if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8');
    var users = JSON.parse(data);
    console.log(users);
} else {
    console.log("Sorry file " + fname + " does not exist.");
}

// creates the response for all requests
app.all('*', function (request, response, next) {
    if(typeof request.session.cart == 'undefined') { request.session.cart = {}; } 
    next();
});



app.get("/use_cookie", function (request, response){
    let my_cookie = request.cookies["my name"];
    response.send("welcome to the use cookie page " + my_cookie);
    // uses the session, but when the cookie times out, the my name variable will be undefined
});

app.get("/use_session", function (request, response){
    response.send("welcome, your session ID is: " + request.session.id);
    request.session.destroy();
});

app.get("/login", function (request, response) {
    // Give a simple login form
    if (typeof request.session.last_login != 'undefined'){
        login_time = "last login was" + request.session.last_login;
    } else {
        login_time = "first login";
    }
    if (typeof request.cookies.username != 'undefined') {
        my_cookie_name = request.cookies["username"]; // "grabbing" the cookie to be used
    } else {
        my_cookie_name = "No user";
    }
    

    str = `
<body>
<form action="" method="POST">
login info: ${login_time} by ${my_cookie_name}<br>
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let POST = request.body;
    let user_name = POST["username"];
    let user_pass = POST["password"];



    console.log("User name=" + user_name + " password=" + user_pass);
    
    if (users[user_name] != undefined) {
        if (users[user_name].password == user_pass) {
            if (typeof request.session.last_login != 'undefined'){
            var msg = `you last logged in: ${request.session.last_login}`;
            var now = new Date();
        } else {
            var msg = ''
            var now = " first visit";
        }
        request.session.last_login = now; // creating a variable in the session, lives in the session
        response.cookie('username', user_name).send(`${msg} <br> ${user_name} logged in ${now}` );
    } else {
        response.send('No such user');
    }
}
});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

 app.post("/register", function (request, response) {

    
    // process a simple register form
    let POST = request.body;
    console.log(POST);
    let user_name = POST["username"];
    let user_pass = POST["password"];
    let user_email = POST["email"];
    let user_pass2 = POST["repeat_password"];

   
    if (users[user_name] == undefined && user_pass == user_pass2) {
        users[user_name] = {};
        users[user_name].name = user_name;
        users[user_name].password = user_pass;
        users[user_name].email = user_email; 
        users[user_name].repeat_password = user_pass2;

        let data = JSON.stringify(users);
        fs.writeFileSync(fname, data, 'utf-8');

        response.send("Got a registration");
    } else if (users[user_name] != undefined && user_pass == user_pass2) {
        response.send("User " + user_name + " already exists!");
    } else if (users[user_name] == undefined && user_pass != user_pass2) {
        response.send("Passwords do not match!");
    }


 });

app.get("/get_products_data", function (request, response) {
    response.json(products_data);
});

app.get("/add_to_cart", function (request, response) {
    products_key = request.query['products_key']; // get the product key sent from the form post
    quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
    request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
    response.redirect('./cart.html');
});

// Define the increaseQuantity() function and pass the products_key variable as an argument
function increaseQuantity(request, products_key, index) {
    // Use the passed products_key variable inside the function
    request.session.cart[products_key][index] += 1;
  }
  
  // Define the app.get() method and pass the products_key variable as an argument
  app.get("/increase_quantity", function(request, response) {
    // Get the index of the item from the request query string
    var index = request.query.index;
  
    // Increase the value of the item in the array by 1
    increaseQuantity(request, products_key, index);
  
    // Redirect the user back to the shopping cart page
    response.redirect("./cart.html");
  });

  function decreaseQuantity(request, products_key, index) {
    // Check the value of the item in the array
    if (request.session.cart[products_key][index] > 0) {
    // Use the passed products_key variable inside the function
    request.session.cart[products_key][index] -= 1;
    }
  }
  
  // Define the app.get() method and pass the products_key variable as an argument
  app.get("/decrease_quantity", function(request, response) {
    // Get the index of the item from the request query string
    var index = request.query.index;
  
    // Increase the value of the item in the array by 1
    decreaseQuantity(request, products_key, index);
  
    // Redirect the user back to the shopping cart page
    response.redirect("./cart.html");
  });

app.get("/get_cart", function (request, response) {
    response.json(request.session.cart);
});




app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));