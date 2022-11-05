// Author: Justin Enoki
// Date: October 31, 2022
// This file holds the different functions that display my product info and invoice on the main html 
// web page. Also gives the main layout for the invoice.

// create a variable to store the products 'database' in
var products;

        //function code from previous labs checking if an integer is a valid integer or not.
        //IR2
        function isNonNegInt(q, return_errors = false) {
            errors = []; // assume no errors at first
            if (q == '') q = 0; // handle blank inputs as if they are 0
            if (Number(q) != q) errors.push('<font color="red"><b>Not a number!</b></font>'); // Check if string is a number value
            else if (q < 0) errors.push('<font color="red"><b>Negative value!</b></font>'); // Check if it is non-negative
            else if (parseInt(q) != q) errors.push('<font color="red"><b>Not an integer!</b></font>'); // Check that it is an integer
            return return_errors ? errors : (errors.length == 0);
        }

        // Shows user if they are inputting an invalid integer or not, dynamically
        function checkQuantityTextbox(theTextbox) {
            errs = isNonNegInt(theTextbox.value, true);
            if (errs.length == 0) errs = ['You want:'];
            if (theTextbox.value.trim() == '') errs = ['Quantity'];
            document.getElementById(theTextbox.name + '_label').innerHTML = errs.join(", ");
        }




function display_invoice(invoice_data) {
    // displays the hidden invoice in the same html web page
    products_main_display.innerHTML = invoice_div.innerHTML;

    for (i = 0; i < products.length; i++) {
        a_qty = invoice_data.quantities[`quantity${i}`];
        if (a_qty > 0) {
            // product row
            extended_price = a_qty * products[i].price;
            newRow = document.getElementById("invoice_table").insertRow(1);
            newRow.innerHTML = `
    <td width="43%"> <img src="${products[i].image}" style="width:20%; height:20%">${products[i].brand}</td>
    <td align="center" width="11%">${a_qty}</td>
    <td width="13%">\$${products[i].price}</td>
    <td width="54%">\$${extended_price}</td>
  `;
        }
    }
    // Table layout formatted from Invoice 3
    // add subtotal row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
    <td width="54%">\$${invoice_data.subtotal}</td>
    `;
    // add tax row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @ ${100 * invoice_data.tax_rate}%</span></td>
    <td width="54%">\$${invoice_data.tax.toFixed(2)}</td>
    `;
    // add shipping row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%">Shipping</span></td>
    <td width="54%">\$${invoice_data.shipping.toFixed(2)}</td>
    `;
    // add total row
    newRow = document.getElementById("invoice_table").insertRow();
    newRow.innerHTML = `
    <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
    <td width="54%"><strong>\$${invoice_data.total.toFixed(2)}</td>
    `;
    document.getElementById("display_footer").innerHTML = '<h1>Thank you for shopping with us!<h1>';
    document.getElementById("display_footer").innerHTML = '<input type="button" class="button" value="Return to Store" onclick="window.location.href = `products_store.html`;"></input>';
}

// function gathers the information from the purchase form and sends the response to the server
function process_purchase() {
    data = new URLSearchParams(new FormData(product_form));
    fetch('/process_purchase', 
    {
        method: 'post',
        body: data
    }
    ).then(function (response) {
        if (response.ok) {
            response.json().then(function (invoice_data) {
                display_invoice(invoice_data);
            });
        } else {
            console.log('Network request for /process_form failed with response ' + response.status + ': ' + response.statusText);
        }
    });
    
}



