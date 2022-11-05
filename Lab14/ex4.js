var express = require('express');
var app = express();

//decode the body of requests
app.use(express.urlencoded({ extended: true }));

var fs = require('fs');

var fname = 'user_data.json';

//exists returns a boolean, true or false, so you can put it in a if statement
if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8');
    var users = JSON.parse(data);
    console.log(users);
} else {
    console.log("sorry file" + fname + "does not exist");
}


//respond to path /login
app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
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
    let user_password = POST["password"];

    console.log("username: " + user_name + " password: " + user_password);
    response.send("got a user")

    if (users[user_name] != undefined) {
        if (users[user_name].password == user_password){
            response.send ("good login for user " + user_name);
        } else {
            response.redirect("/login?error='bad password'");
        }
    } else {
        response.redirect("/login?error='no such user'");
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

    if(users[user_name] == undefined) { //if statement to where if the username already exists, it would be defined and the rest of the code won't run, it'll run the else statement

        //create new element within users
        users[user_name] = {}; // creates a new attribute within the username object
        users[user_name].name = user_name;
        users[user_name].password = user_pass;
        users[user_name].email = user_email;
        users[user_name].repeat_password = user_pass2

        let data = JSON.stringify(users);
        fs.writeFileSync(fname, data, 'utf-8');

        response.send("got a registration."); // after this, should send to the invoice page
    } else {
        response.send("user: " + user_name + " already exists!");
    }

 });


app.listen(8080, () => console.log(`listening on port 8080`));