var attributes  =  "Justin;22;Accounting";
var pieces = attributes.split(";");

for (i=0; i<pieces.length; i++){
    console.log(`i=${i} value=${pieces[i]} type=${typeof pieces[i]}`);
}