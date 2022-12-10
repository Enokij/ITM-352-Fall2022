var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');

app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));


app.use(express.urlencoded({ extended: true }));

var fs = require('fs');
var fname = "user_data.json";

if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8');
    var users = JSON.parse(data);
    console.log(users);
} else {
    console.log("Sorry file " + fname + " does not exist.");
}

app.get("/set_cookie", function (request, response){
    let my_name = "Justin Enoki";
    response.cookie("My name", my_name, {maxAge: 50000}).send("Cookie sent");
    // sends the cookie and sets the session
});

app.get("/use_cookie", function (request, response){
    let my_cookie = request.cookies["my name"];
    response.send("welcome to the use cookie page " + my_cookie);
    // uses the session, but when the cookie times out, the my name variable will be undefined
});

app.get("/use_session", function (request, response){
    response.send("welcome, your session ID is: " + request.session.id);
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

app.listen(8080, () => console.log(`listening on port 8080`));