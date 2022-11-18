const fs = require('fs');
var express = require('express');
var app = express();

// get entire file as array of lines of user info data
var filename = "user_info.json";
if (fs.existsSync(filename)) {
    data = fs.readFileSync(filename, 'utf-8');
    // split data by new line
    var lines = data.split(/\r?\n/);

} else {
    console.log(filename + ' does not exist!');
    const lines = [];
}

app.use(express.urlencoded({extended:true}));

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
    the_username = request.body['username'].toLowerCase();
    the_password = request.body['password'];
    var user_info = get_user_info(the_username);
    console.log(user_info);
    if (typeof user_info != 'undefined') {
        if (
            
            user_info.password == the_password) {
            response.send(`User ${the_username} is logged in`);
        } else {
            response.send(`Wrong password!`);
        }
        return;
    }
    response.send(`${the_username} does not exist`);
});

var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });

function get_user_info(a_username) {
    // go through lines and look for username. If found, returns object with user data, otherwise returns undefined.
    // Format is assumed to be username;password;fullname
    var user_data = undefined;
    for(i in lines) {
        let user_data_array = lines[i].split(';');
        if(user_data_array[0] == a_username) { // found it!
            user_data = {'password': user_data_array[1], 'name': user_data_array[2]};
            break; 
        }
    }
    return user_data;
}