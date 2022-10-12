
index = 0;
item = 0;
var attributes = "Daniel;21;21.5;-20.5";
var pieces = attributes.split(";");

// Function that takes a string as input and, depending on the value of returnErrors, returns an array of errors or a boolean indicating: true
// if that string is a non-negative integer and false otherwise.
function isNonNegInt(queryString, returnErrors = false){
    errors = []; // assume no errors at first
    if(Number(queryString) != queryString) errors.push('Not a number!'); // Check if string is a number value
    if(queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer

    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
            return true;
    } else { 
            return false;
    }
    }





function checkIt(item, index){
        
}

for (i=0; i<pieces.length; i++) {
        errorArray = isNonNegInt(pieces[i], true);
        console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
        pieces.forEach(checkIt);
        
}



