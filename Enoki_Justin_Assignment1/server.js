//Author: Justin Enoki
//Date: October 31, 2022
//Description: .js file to handle the client reqs sent to the server.

var express = require('express');
var myParser = require("body-parser");
var products = require('./public/products.json');
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname + '/public'));
app.use(myParser.urlencoded({ extended: true }));

        //function code from previous labs checking if an integer is a valid integer or not.
        //IR2
        function isNonNegInt(inputReq, return_errors = false) {
            errors = []; // assume no errors at first
            if (inputReq == '') inputReq = 0; // handle blank inputs as if they are 0
            if (Number(inputReq) != inputReq) errors.push('<font color="red"><b>Not a number!</b></font>'); // Check if string is a number value
            else if (inputReq < 0) errors.push('<font color="red"><b>Negative value!</b></font>'); // Check if it is non-negative
            else if (parseInt(inputReq) != inputReq) errors.push('<font color="red"><b>Not an integer!</b></font>'); // Check that it is an integer
            return return_errors ? errors : (errors.length == 0);
        }


//to track quantity sold
products.forEach((products,i) => {products.total_sold = 0});


//monitor requests
app.get("/products.js", function (req, res, next) {
    res.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    //Send string of data as response to requests
    res.send(products_str);
 });

 //respond to any req for any path
app.all('*', function (req, res, next) {
    console.log(req.method + ' to path ' + req.path);
    next();
});


app.post('/process_purchase', function (req, res, next) {
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
    invoice_data = invoice(req.body);
    res.json(invoice_data);
    // Process the form by redirecting to the receipt page if everything is valid.
    let valid = true;

    for (i = 0; i < products.length; i++) { // Iterate over all text boxes in the form.
        var name = "quantity" + i;
        var numberOfProducts = req.body[name];
        var goodQuantity = false;
        var res_str = JSON.stringify(req.body);

        if (typeof numberOfProducts != 'undefined') {
            if (isNonNegInt(numberOfProducts) && numberOfProducts > 0) {  
                // We have a valid quantity. Add to the ordered string.
                products[i].total_sold += Number(numberOfProducts);
                products[i].quantity_available -= Number(numberOfProducts);
                goodQuantity = true; 
            } else {
                // We have an invalid quantity. Set the valid flag to false.
                valid = false;
            }
        } else {
            // The textbox was not found.  Signal a problem.
            valid = false;
        }
    }

    next(); 
});

app.use(express.static('./public'));

var listener = app.listen(8080, () => { console.log('server listening on port ' + listener.address().port); });

function invoice(quantities) {
    subtotal = 0;
    for (i = 0; i < products.length; i++) {
        a_qty = quantities[`quantity${i}`];
        if (a_qty > 0) {
            // add to subtotal
            subtotal += a_qty * products[i].price;
        }
    }
    // Compute tax
    var tax_rate = 0.0575;
    var tax = tax_rate * subtotal;

    // Compute shipping
    if (subtotal <= 50) {
        shipping = 2;
    }
    else if (subtotal <= 100) {
        shipping = 5;
    }
    else {
        shipping = 0.05 * subtotal; // 5% of subtotal
    }

    // Compute grand total
    var total = subtotal + tax + shipping;

    return {
        "quantities": quantities,
        "total": total, 
        "subtotal": subtotal, 
        "tax_rate": tax_rate, 
        "tax": tax, 
        "shipping": shipping
        };
}