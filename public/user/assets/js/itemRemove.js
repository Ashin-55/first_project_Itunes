function itemRemove(cartId,productId) {
    console.log("very First")
    $.ajax({
        url:'/removeItem',
        data:{
            cart:cartId,
            productId:productId

        },
        method:"post",
        success: (response)=>{
            console.log("ajax result camed")
            if(response.removeProduct){
                alert("product removed from cart")

            }
            
        }
    })

}