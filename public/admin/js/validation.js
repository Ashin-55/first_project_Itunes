function addProValidation(){
    let proName=document.getElementById('Name').value
    let proDiscription=document.getElementById('Discription').value
    let proLandingCost=document.getElementById('LandingCost').value
    let proPrize=document.getElementById('Prize').value
    let proQuantity=document.getElementById('Quantity').value
    let proCategory=document.getElementById('Category').value
    let proROM = document.getElementById('Rom').value
    let proColor = document.getElementById('Color').value
    let proImage1 = document.getElementById('Image1').value
    let proImage2 = document.getElementById("Image2").value
    let proImage3 = document.getElementById('Image3').value
    let proImage4 = document.getElementById('Image3').value


    if(proName == " "){
        document.getElementById('proNameErr').innerHTML="**field must be filled"
        return false;
    }else if(proDiscription==" "){
        document.getElementById('proDiscriptionErr').innerHTML='**this field must be filled'
        return false
    }else if(proLandingCost==" "){
        document.getElementById('proLandingCostErr').innerHTML='**rnter the landing cost of product'
        return false
    }else if(proPrize ==" "){
        document.getElementById('proPrizeErr').innerHTML="**this field must be filled"
        return false
    }else if(proQuantity ==" "){
        document.getElementById('proQuantityErr').innerHTML="**Enter the quantity of product"
        return false
    }else if(proCategory ==" "){
        document.getElementById('proCategoryErr').innerHTML="**choose Product Category"
        return false
    }else if(proROM==" "){
        document.getElementById('proCategoryErr').innerHTML="**select ROM of product"
        return false
    }else if(proColor==" "){
        document.getElementById('proCategoryErr').innerHTML="**Enter Color of the product"
        return false
    }else if(proColor ==" "){
        document.getElementById('proColorErr').innerHTML="**Enter the color of the product"
        return false
    }else if(proImage1==" "){
        document.getElementById('proImagErr').innerHTML="**First Image cant Empty"
        return false
    }else if(proImage2==" "){
        document.getElementById('proImageErr').innerHTML="**Second Image cant Empty"
        return false
    }else if(proImage3==" "){
        document.getElementById('proImageErr').innerHTML="**Third Image cant Empty "
        return false
    }else if(proImage4==" "){
        document.getElementById('proImageErr').innerHTML="**Fourth Image cant Empty"
        return false
    }else{
        return true
    }
}