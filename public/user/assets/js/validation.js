function validation(form){

    let fname = document.getElementById("firstName").value
    let lname = document.getElementById("lastName").value
    let email = document.getElementById("email").value
    let phone = document.getElementById("mobilePhone").value
    let pass1 = document.getElementById("password").value
    let pass2 = document.getElementById("CustomerConfirmPassword").value
    


    if(fname == ""){
        document.getElementById("fnameerr").innerHTML="*Enter first name"
        return false
    }
    if(lname == ""){
        document.getElementById('lnameerr').innerHTML="*Enter last name"
        return false
    }
   
    if(email == ""){
        document.getElementById("emailerr").innerHTML="*Enter email address"
        return false
    }
    if(email.indexOf("@") <= 0 ){
        document.getElementById("emailerr").innerHTML="*invalid emailid"
        return false
    }
    if (
        email.charAt(email.length - 4) != "." &&
        email.charAt(email.length - 3) != "."
      ) {
        document.getElementById("emailerr").innerHTML = " ** Invalid Email";
        return false;
      }

    if(phone == ""){
        document.getElementById("phoneerr").innerHTML="Enter mobile number"
        return false
    }
    // if(phone.length != 11){
    //     document.getElementById('phonelen').innerHTML="*number must be less than 11 numbers"
    //     return false
    // }
    if (isNaN(phone)) {
        document.getElementById("phoneerr").innerHTML =
          " ** user must write digits only not characters";
        return false;
      }
   
    if(pass1 == ""){
        document.getElementById("password1").innerHTML="*must be filled"
        return false
    }
    if(pass2 == ""){
        document.getElementById("password2").innerHTML="*must be filled"
        return false
    }
    if(pass1 != pass2 ){
        document.getElementById("passdiff").innerHTML="*password does not match"
        return false
    }
   
    


}