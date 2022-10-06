// Birthdate: 11/27/1999
step1 = 99;
step2 = parseInt(step1/4);
step3 = step2 + step1;
step4 = 3; // Not Jan, so look at month before on table
step6 = step4 + step3;
step7 = step6 + 27;
if (step7>7) {
    remainder = (step7%7);
}

console.log(remainder);
