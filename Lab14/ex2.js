var fs = require('fs');

var fname = 'user_data.json';

//exists returns a boolean, true or false, so you can put it in a if statement
if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8');
    var status = fs.statSync(fname);
    console.log("the file is " + status.size + " bytes");
    var users = JSON.parse(data);
    console.log(data);
} else {
    console.log("sorry file" + fname + "does not exist");
}

console.log(users);