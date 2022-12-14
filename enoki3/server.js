var express = require('express'); // referenced from lab14 server lab
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');
var products_data = require('./products.json');
var user_data = require("./user_data.json");


order_str = "";


app.use(session(
    {secret: "MySecretKey", 
    resave: false, 
    saveUninitialized: true,
    cookie: {
        maxAge: 50000,
        httpOnly: true,
        secure: false,
        signed: true
    }
}));

var fs = require('fs');
var fname = "user_data.json"

const crypto = require('crypto'); // used to encrypt password, taken from my assignment2
const algorithm = 'aes-256-cbc'; // defines the encryption algorithm
const key = 'asdfasdfasdfasdfasdfasdfasdfasdf'; // defines the key used in the algorithm, it is set so that each unique password has a specified encryption attached to it
const iv = 'asdfasdfasdfasdf'; // defines the initializing variable at its initial state, this is set instead of a randomByte method so that everytime you enter the same password, it will encyrpt as the same encrytion data. Used to match passwords when logging in

function encrypt(text) { // this function encrypts text such as passwords
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv); // defines the variable cipher to the encryption algorithm using the key and iv
    let encrypted = cipher.update(text); // updates the text with the encryption, basically encrypting the password
    encrypted = Buffer.concat([encrypted, cipher.final()]); // uses concatenation to link the series of text so that it may be output
    return encrypted.toString('hex'); // returns the encrypted password as a string so that it can be compared to the user input password
}


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

app.get("/get_users", function (request, response) {
    response.json(user_data);
});

app.get("/get_cookies", function (request, response) {
    response.json(request.cookies);
});

app.get("/use_session", function (request, response){
    response.send("welcome, your session ID is: " + request.session.id);
    request.session.destroy();
});

app.get("/login", function (request, response) {
    // Give a simple login form
    if (typeof request.session.last_login != 'undefined'){
        login_time = "last login was" + request.session.last_login;
        request.session.cart;
    } else {
        login_time = "first login";
    }
    if (typeof request.cookies.username != 'undefined') {
        my_cookie_name = request.cookies["username"]; // "grabbing" the cookie to be used
    } else {
        my_cookie_name = "No user";
    }

    var params = new URLSearchParams(request.query); // use search params to find the params within the document    
    console.log(params);
    

    str = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="homepage.css" rel="stylesheet">
    <title>Login</title>
</head>

<body>
<ul>
<li><a href="./index.html">Home</a></li>
<li><a id="login-link" href="/login">Login</a></li>
<li><a href="/register">Register</a></li>
<li class="dropdown">
  <a href="javascript:void(0)" class="dropbtn">Products</a>
  <div class="dropdown-content">
    <script>
    document.write('<a href='./products.html?products_key=keyboards'>Keyboards');
    document.write('<a href='./products.html?products_key=switches'>Switches');
    document.write('<a href='./products.html?products_key=keycaps'>Keycaps');
</script>
  </div>
</li>
<li style="float:right"><a class="active" href="./cart.html">Cart</a></li>
</ul>
    <form action="/login" method="POST">
        login info: ${login_time} by ${my_cookie_name}<br>
        <input type="text" name="email" size="40" placeholder="enter email"><br />
        <input type="password" name="password" size="40" placeholder="enter password"><br />
        <input type="submit" value="Submit" id="submit">
        <button type="button" style="position: absolute;" id="return_shopping"
            onclick="window.location.href = './products.html?products_key=keyboards'">Return to shopping</button>
    </form>
</body>
</html>`;
    response.send(str);
 });


app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let POST = request.body;
    user_email = POST["email"];
    var user_pass = encrypt(request.body.password); // uses my encryption function to encrypt the users entered password
    loggedIn = false;
    

    
    console.log("User email=" + user_email + " password=" + user_pass);
    
    if (users[user_email] != undefined) {
        if (users[user_email].password == user_pass) {
            if (typeof request.session.last_login != 'undefined'){
            var msg = `you last logged in: ${request.session.last_login}`;
            var now = new Date();
            loggedIn=true;
        } else {
            var msg = ''
            var now = " first visit";
            loggedIn=true;
        }
        request.session.last_login = now; // creating a variable in the session, lives in the session
        response.cookie("email", user_email);
        response.cookie('loggedIn', loggedIn)
        response.cookie('cart', request.session.cart)
        response.redirect('./cart.html');        
    } else {
        response.send('No such user');
    }
}
});

app.get('/logout', (request, response) => {
  // Destroy the cookie's created from login
  response.clearCookie('email');
  response.clearCookie('loggedIn');
  response.clearCookie('cart');
  // Destroy the session
  request.session.destroy(() => {
    // Redirect the user to the login page
    response.redirect('./index.html');
  });
});

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="homepage.css" rel="stylesheet">
        <title>Login</title>
    </head>
<body>
<ul>
<li><a href="./index.html">Home</a></li>
<li><a id="login-link" href="/login">Login</a></li>
<li><a href="/register">Register</a></li>
<li class="dropdown">
  <a href="javascript:void(0)" class="dropbtn">Products</a>
  <div class="dropdown-content">
    <script>
    document.write('<a href='./products.html?products_key=keyboards'>Keyboards');
    document.write('<a href='./products.html?products_key=switches'>Switches');
    document.write('<a href='./products.html?products_key=keycaps'>Keycaps');
</script>
  </div>
</li>
<li style="float:right"><a class="active" href="./cart.html">Cart</a></li>
</ul>
<form action="/register" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
</html>
    `;
    response.send(str);
 });

 app.post("/register", function (request, response) {

    // process a simple register form
    let POST = request.body;
    console.log(POST);
    let encryptedPass = encrypt(POST["password"]);
    let reg_error = {};
     user_name = POST["username"];
     user_pass = POST["password"];
     user_email = POST["email"];
     user_pass2 = POST["repeat_password"];

   
    // used object.keys for the array to check that errors equal to zero
    // ref for objectkeys: https://www.w3schools.com/jsref/jsref_object_keys.asp
    if (Object.keys(reg_error).length == 0) { 
        var email = POST['email'].toLowerCase();
        users[email] = {};
        users[email].name = POST['username'];
        users[email]["password"] = encryptedPass;
        users[email]["email"] = POST['email'];
        users[email].num_loggedIn = 0;
        users[email].last_login = Date();
        
        // this creates a string using are variable fname which is from users and then JSON will stringify the data "users"
        fs.writeFileSync(fname, JSON.stringify(users), "utf-8"); 
        // redirect to login page if all registered data is good, we want to keep the name enter so that when they go to the invoice page after logging in with their new user account
        response.redirect('/login?' + order_str + '&' + `username=${user_name}` + '&' + `date=${users[email].last_login}`); 
    } else {
        POST['reg_error'] = JSON.stringify(reg_error); // if there are errors we want to create a string 
        let params = new URLSearchParams(POST);
        response.redirect('register?' + order_str + params.toString()); // then we will redirect them to the register if they have errors
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

app.post("/update_cart",function(request, response){
    if(request.cookies.loggedIn == "true"){
        updated_qty = request.session.cart
        response.cookie('cart', updated_qty);
        response.redirect('./invoice.html')
    } else {
        response.redirect("/login")
    }
});

// Define the increaseQuantity() function and pass the products_key variable as an argument
function increaseQuantity(request, products_key, productId, product_key, products_data) {

      // Use the passed product_key variable to access the correct array of products in the products_data object
    var products = products_data[product_key];

    var index = products.findIndex(product => product.id === productId);

    // Use the passed products_key variable inside the function to update the quantity of the selected product in the request.session.cart array
    request.session.cart[product_key][index] += 1;
      }
  
  // Define the app.get() method and pass the products_key variable as an argument
  app.get("/increase_quantity", function(request, response) {
    // Get the index of the item from the request query string
    var productId = request.query.productId;

    // Get the product_key of the selected product from the request query string
    var product_key = request.query.product_key;
  
    // Increase the value of the item in the array by 1
    increaseQuantity(request, products_key, productId, product_key, products_data);
  
    // Redirect the user back to the shopping cart page
    response.redirect("./cart.html");
  });

// Define the increaseQuantity() function and pass the products_key variable as an argument
function decreaseQuantity(request, products_key, productId, product_key, products_data) {

    // Use the passed product_key variable to access the correct array of products in the products_data object
  var products = products_data[product_key];

  var index = products.findIndex(product => product.id === productId);

  // Use the passed products_key variable inside the function to update the quantity of the selected product in the request.session.cart array
  request.session.cart[product_key][index] -= 1;
    }

// Define the app.get() method and pass the products_key variable as an argument
app.get("/decrease_quantity", function(request, response) {
  // Get the index of the item from the request query string
  var productId = request.query.productId;

  // Get the product_key of the selected product from the request query string
  var product_key = request.query.product_key;

  // Increase the value of the item in the array by 1
  decreaseQuantity(request, products_key, productId, product_key, products_data);

  // Redirect the user back to the shopping cart page
  response.redirect("./cart.html");
});

app.get("/get_cart", function (request, response) {
    response.json(request.session.cart);
});

app.post("/get_to_cart", function (request, response){
    // Get the input element
    var quantityBox = document.getElementById("quantity-box");
    // Get the value from the input element
    var quantity = quantityBox.value;
    // Set the value in the session storage
    sessionStorage.setItem("quantity", quantity);
});



app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));