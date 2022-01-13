function addToCart(productId){
    $.ajax({
        url:'/add-to-cart/'+productId,
        method:"get",
        success:(response)=>{
            if(response.status){
               
            
              const Toast = Swal.mixin({
                toast: true,
                position: 'top-right',
                showConfirmButton: false,
                timer: 1000,
                timerProgressBar: true,
        
              })
              
              Toast.fire({
                icon: 'success',
                title: 'item added to the cart'
              })
              let count = $('#CartCount').html()
                
               count=parseInt(count)+1
               console.log("the count is"+count)
               $('#CartCount').html(count)
             

            }else{
                      
              const Toast = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
        
              })
              
              Toast.fire({
                icon: 'error',
                title: 'please login to continue'
              })
           
            }
             
        }
    })
}


function buyNow(productId){
  $.ajax({
      url:'/buyNow/'+productId,
      method:"get",
      success:(response)=>{
          if(response.status){
      
            let count = $('#CartCount').html()
              
             count=parseInt(count)
             console.log("the count is"+count)
             $('#CartCount').html(count)
             location.href = "/cart"

          }else{
        
            const Toast = Swal.mixin({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
      
            })
            
            Toast.fire({
              icon: 'error',
              title: 'please login to continue'
            })
          }
           
      }
  })
}




function addToWishlist(event,productId){
  
    $.ajax({
        url:"/add-to-wishlist/"+productId,
        method:"get",
        
        success:(response)=>{
            console.log(response)
          if(response.user){


            if(response.status){ 
              console.log("hai")
              console.log(productId)
              event.target.classList.remove( "icon","text-danger")              
              
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
            
                  })
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'item removed from wishlist!'
                  })
                  
                 
            }else{
               event.target.classList.add("icon","text-danger")
                 
                  const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-right',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
            
                  })
                  
                  Toast.fire({
                    icon: 'success',
                    title: 'item added to wishlist!'
                  })
              
            }
          }else{
             
          
            const Toast = Swal.mixin({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
      
            })
            
            Toast.fire({
              icon: 'error',
              title: 'please login to continue'
            })
        } 
          
        }
    })
}







// remove item from cart
function itemRemove(cartId,productId) {
const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  
  swalWithBootstrapButtons.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'No, cancel!',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {


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
                   
                    Swal.fire({
                        icon: 'success',
                        text: 'item removed from cart!',
                        showConfirmButton:false,
                        footer: '<a href="/cart" class="btn btn-primary">ok</a>'
                      })
                }
                
            }
        })
    
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        'Cancelled',
        'Your product is not removed from cart :)',
        'error',
        
      )
    }
  })

}





//remove item from wishlist and remove to cart
function romoveWishlist(productId,wishlistId){
    console.log("come to wishlist remove ajax")


    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false
      })
      
      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {

            $.ajax({
                url:"/wishlistRemove",
                data: {
                    product:productId,
                    wishlist:wishlistId
            
                   },
                method:"post",
                success:(response)=>{
            
                    if(response.removeProduct){
            
                        console.log("come to here success")
                            Swal.fire({
                            icon: 'success',
                            text: 'item removed from wishlist!',
                            showConfirmButton:false,
                            footer: '<a href="/wishlist" class="btn btn-primary">ok</a>'
                          })
                       
                    }
                    
                }
                     
            })
         
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Product is not removed from wishlist :)',
            'error'
          )
        }
      })
  

}












//remove item from wishlist and remove to cart
// function romoveWishlist(productId,wishlistId){
//     console.log("come to wishlist remove ajax")
//     $.ajax({
//         url:"/wishlistRemove",
//         data: {
//             product:productId,
//             wishlist:wishlistId

//            },
//         method:"post",
//         success:(response)=>{

//             if(response.removeProduct){

//                 console.log("come to here success")
//                 alert("item removed from wishlist")
//                 location.reload()
//             }
            
//         }
             
//     })

// }

// item remove from cart
// function itemRemove(cartId,productId) {
//     console.log("very First")
//     $.ajax({
//         url:'/removeItem',
//         data:{
//             cart:cartId,
//             productId:productId

//         },
//         method:"post",
//         success: (response)=>{
//             console.log("ajax result camed")
//             if(response.removeProduct){
//                 alert("product removed from cart")
//                 location.reload()
//             }
            
//         }
//     })

// }


