var express = require('express');
const { check, validationResult } = require('express-validator');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')
const config = require('../config/twilio');
const { response } = require('../app');
var moment = require('moment');
var objectId = require('mongodb').ObjectID
const { getUserDetails } = require('../helpers/user-helpers');

const client = require('twilio')(config.accountSID, config.authToken)
const paypal = require("paypal-rest-sdk");
const { route } = require('./admin');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'Ae0G6TfFtS4xeCka6coRql0BO_868W29PjBdolVidNDtJhK8Mxnj-aL_uebNnaZ9Q-zE1llAqj9GCvdK',
  'client_secret': 'EOLwX5u2s2BTZ5BrCnVo9qjQ83Jg4EISHb9Os4tu0B4HVEF2xJZyDo6UjDzUwIZNOcupiUy_MlXW7_y9'
});



//function for check user is valid
const verifyLogin = (req, res, next) => {

  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}
// user valid function ends

//category function 
const allCategory = async (req, res, next) => {
  let data = await userHelpers.getCategory()
  if (data) {
    res.data = data
    next()
  } else {
    next()
  }
}

// cartcount function
const cartcountFun = async (req, res, next) => {
  if (req.session.user) {
    res.cartCount = await userHelpers.getCartCount(req.session.user._id)
    next()
  } else {
    next()
  }
}



let signup_body = {}
let mobilelogin_body = {}

/* GET home page. */
router.get('/', allCategory, async function (req, res, next) {
  let user = req.session.user
  //console.log(user)
  let cartCount = null
  let getWishlist = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
    //  getWishlist = await userHelpers.getWishlist(req.session.user._id)
    //    console.log(getWishlist)

  }
  let allBanner = await userHelpers.getBannerItems()
  let product = await userHelpers.getAllProduct()
  let brand = await userHelpers.getBrand()
  console.log(product.offer)

  console.log(product)
  res.render('user/home', { 'layout': 'user/layout', category: res.data, user, product, cartCount, allBanner, brand });
});


// login starts
router.get('/login', allCategory, (req, res) => {
  console.log("this values is")
  if (req.session.user) {
    res.redirect('/')
  } else {
    console.log("haiii2")
    res.render('user/login', {
      'layout': 'user/layout', 'userLogginError': req.session.userLogginError,
      "userMobileLoginErr": req.session.userMobileLoginErr, category: res.data
    })
    req.session.userLogginError = null
    req.session.userMobileLoginErr = null
  }

})

router.post('/login', (req, res) => {
  console.log(req.body)
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user;
      req.session.user.loggedIn = true;
      res.redirect('/')
    } else {
      //ivalid message passing
      req.session.userLogginError = "Invalid Email id or Password"
      res.redirect('/login')
    }
  })
})
// login ends


// logout start
router.get('/logout', allCategory, (req, res) => {
  req.session.user = null
  res.redirect('/')
})
// logout ends


// signup starts
router.get('/signup', (req, res) => {
  res.render('user/signup', { 'layout': 'user/layout', "userExists": req.session.userExists, category: res.data })
  req.session.userExists = null
});

router.post('/signup', allCategory, (req, res) => {
  signup_body = req.body
  console.log(req.body)
  mobilenumber = signup_body.mobilePhone
  userHelpers.checkUser(req.body.mobilePhone).then((response) => {
    if (response) {
      req.session.userExists = "This number is allready used"
      res.redirect('/signup')
    } else {
      client.verify.services(config.serviceID).verifications.create({
        to: `+91${signup_body.mobilePhone}`,
        channel: 'sms'
      }).then((data) => {
        // console.log("the returned data is =" + data)
      })
      // console.log(signup_body);
      res.render('user/signup-verification', { 'layout': 'user/layout', mobilenumber, category: res.data })
    }
  })
}
)
// signup ends


// otp verification signupstart
router.get('/signup-verification', allCategory, (req, res) => {
  res.render('user/signup-verification', { 'layout': 'user/layout', "userWrongOTPErr": req.session.userWrongOTPErr, category: res.data })
  req.session.userWrongOTPErr = null
})
router.post('/signup-verification', (req, res) => {
  console.log(req.body)
  let otp = req.body.otp
  client.verify.services(config.serviceID).verificationChecks.create({
    to: `+91${signup_body.mobilePhone}`,
    code: otp
  }).then((data) => {

    if (data.valid) {
      //  doSignup start
      userHelpers.doSignup(signup_body).then((response) => {
        // console.log(response);
        req.session.user = response.user
        //console.log(req.session.user.loggedIn)

        //req.session.user.loggedIn = true
        res.redirect('/login')
      })
      // doSignup ends 
    } else {
      req.session.userWrongOTPErr = "Please enter Correct OTP number"
      res.redirect('/signup-verification')
    }
  }).catch(e => {
    console.log("err is" + e)
  })
})
// otp verification ends


// login using mobile number
router.get('/loginWithMobile', allCategory, (req, res) => {
  console.log("otp login")

  res.render("user/loginMobile", { "layout": "user/layout", category: res.data })
})
router.post('/loginWithMobile', async (req, res) => {
  console.log("first ")
  mobilelogin_body = req.body
  console.log(mobilelogin_body)
  await userHelpers.mobileCheck(req.body).then((response) => {

    if (response.status) {
      console.log("status true  4")
      client.verify.services(config.serviceID).verifications.create({
        to: `+91${mobilelogin_body.mobilePhone}`,
        channel: 'sms'
      }).then((data) => {
        // console.log("the returned data is =" + data)
      })
      // console.log(signup_body);
      res.redirect('/mobile-verification')
    } else {
      console.log("status false 5")
      console.log("user not found that providede mobile number")
      req.session.userMobileLoginErr = "mobile number is not registered"
      res.redirect('/login')
    }
  })


})

router.get('/mobile-verification', allCategory, (req, res) => {
  res.render('user/mobile-verification', { 'layout': 'user/layout', "userWrongOTPErr": req.session.userWrongOTPErr, category: res.data })
  req.session.userWrongOTPErr = null
})
router.post('/mobile-verification', async (req, res) => {
  console.log(req.body)

  let otp = req.body.otp
  client.verify.services(config.serviceID).verificationChecks.create({
    to: `+91${mobilelogin_body.mobilePhone}`,
    code: otp
  }).then((data) => {

    if (data.valid) {
      //  doSignup start
      userHelpers.doLogin(mobilelogin_body).then((response) => {
        // console.log(response);
        req.session.user = response
        req.session.user.loggedIn = true
        res.redirect('/')
      })
      // doSignup ends 
    } else {
      req.session.userWrongOTPErr = "Please enter Correct OTP number"
      res.redirect('/mobile-verification')
    }
  }).catch(e => {
    console.log("err is" + e)
  })
})
// otp verification ends


// forgot password
router.get('/forgot-password', allCategory, (req, res) => {
  res.render('user/forgot', { 'layout': 'user/layout', category: res.data })
})
router.post('/forgot-password', (req, res) => {
  res.render('user/forgot-otp', { 'layout': 'user/layout' })
})
// forgot password ends


// profile starts
router.get("/profile", verifyLogin, allCategory, async (req, res) => {

  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let wishListItem = await userHelpers.getWishlistItems(req.session.user._id)
  let allOrder = await userHelpers.getUserOrders(req.session.user._id)
  let userData = await userHelpers.getUser(req.session.user._id)
  let getAddress = await userHelpers.getUserAddress(req.session.user._id)
  let getOrders = await userHelpers.getUserOrder(req.session.user._id)
  let orderCount = 0
  if (allOrder) {
    orderCount = allOrder.length
  }
  res.render("user/profile", {
    "layout": "user/layout",
    user: req.session.user, userData, cartCount, getAddress, getOrders, orderCount, category: res.data,wishListItem
  })
})

router.post("/profile", (req, res) => {
  let user_id = req.session.user._id
  userHelpers.addAddress(req.body).then(() => {
    res.redirect("/checkout")
  })
})

router.get("/editAddress/:id", verifyLogin, allCategory, async (req, res) => {
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let addressId = objectId(req.params.id)
  let userId = objectId(req.session.user._id)
  await userHelpers.getAddressDetails(addressId, userId).then((details) => {
    console.log("=================")
    console.log(details)
    res.render("user/edit-address", { "layout": "user/layout", details, user: req.session.user, cartCount, cataegory: res.data })
  }).catch(e => {
    console.log("the err is" + e)
  })
})
router.post("/editAddress/:id", verifyLogin, (req, res) => {
  let data = req.body
  console.log(data)
  userHelpers.updateAddress(data).then((reesponse) => {
    res.redirect("/profile")
  })
})

router.get("/deleteAddress/:id", (req, res) => {
  userHelpers.deleteAddress(req.params.id, req.session.user._id).then((response) => {
    res.redirect("/profile")
  })


})



// edit profile
router.get("/editProfile/:id", verifyLogin, cartcountFun, allCategory, async (req, res) => {
  let userData = await userHelpers.getUser(req.params.id)
  res.render("user/edit-Profilie", { "layout": "user/layout", user: req.session.user, cartCount: res.cartCount, category: res.data, userData })
})
router.post("/editProfile/:id", (req, res) => {
  userHelpers.updateUserProfile(req.params.id, req.body).then((id) => {
    console.log("userProfile edited")
    if (req.files) {
      console.log("image file is founded")
      let image = req.files.profileImages
      image.mv("./public/profile-image/" + req.params.id + "_1.png", (err, done) => {
        if (!err) {
          res.redirect("/profile")
        } else {
          console.log("error occured in edit profile image")
          console.log("the err is  " + err)
        }
      })
    } else {
      console.log("img files not found")
      res.redirect("/profile")
    }
  })
})
// profile ends


// cart starts
router.get('/cart', verifyLogin, allCategory, async (req, res) => {
  console.log("started")

  let products = await userHelpers.getCartPtoducts(req.session.user._id)

  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)

  }
  //console.log(products.total)
  //get  product total pirze
  console.log("second step started")
  //console.log(products[0].product) 

  //last chane was done by uncommented the if conditions bellow to check the cart is empty

  if (products.length != 0) {
    console.log("goto cart with including products")
    let total = await userHelpers.getTotalAmount(req.session.user._id)

    res.render('user/cart', { 'layout': 'user/layout', products, user: req.session.user, total, cartCount, category: res.data })

  } else {
    console.log("goto cart with out products")
    //work when cart is empty ok...
    res.render('user/cart', { 'layout': 'user/layout', user: req.session.user, cartCount, category: res.data })

  }





})

router.get('/add-to-cart/:id', verifyLogin, (req, res) => {
  console.log("add to cart api called");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    //res.redirect('/')
    res.json({ status: true })
  })
})

// buy now 
router.get("/buyNow/:id", verifyLogin, (req, res) => {
  console.log("buynow function called")
  console.log(req.body)
  console.log(req.params.id)
  userHelpers.buyNow(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})


router.post('/change-product-quantity', (req, res, next) => {

  console.log("step1 change quantity of product")
  console.log(req.body)

  userHelpers.changeProductQuantity(req.body).then(async (response) => {

    response.total = await userHelpers.changeQuantityTotalAmount(req.body.user)

    console.log("responsse from change quantity haiiii")
    console.log(response)

    res.json(response)


  })

})


router.post('/removeItem', (req, res, next) => {
  console.log("first")
  userHelpers.romoveProduct(req.body).then((response) => {
    res.json(response)
  })
})


router.post('/wishlistRemove', (req, res) => {
  console.log("enter to userjs remove wishlist item")
  userHelpers.removeWishlist(req.body).then((response) => {
    console.log("remove item response " + response)
    res.json(response)
  })
})



// cart ends

// check out start
router.get('/checkout', verifyLogin, allCategory, async (req, res) => {
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let product = await userHelpers.getCartPtoducts(req.session.user._id)
  console.log(product)
  if (product.length != 0) {
    console.log(" error founded")
    let totalAmmount = await userHelpers.getTotalAmount(req.session.user._id)
    if (req.session.newAmount) {
      totalAmmount = req.session.newAmount
    }
    let savedAddress = await userHelpers.getSavedAddress(req.session.user._id)
    console.log(savedAddress)
    let savedAdd = false
    if(savedAddress!=undefined){
      if (savedAddress.length > 0) {
        savedAdd = true
      }
    }

    console.log("result:" + totalAmmount)
    res.render('user/checkout', {
      'layout': 'user/layout',
      user: req.session.user, product, savedAdd, totalAmmount, savedAddress, cartCount, category: res.data
    })
    req.session.addressEmptyErr = null
  } else {
    console.log(" error founded2")
    res.redirect('/shop')
  }
})

router.post('/checkout', verifyLogin, async (req, res) => {
  // let address = await userHelpers.checkoutAddress()
  console.log(req.body.checkbox)
  if (req.body.checkbox == undefined) {
    console.log("workedd")
    // req.session.addressEmptyErr = "** please provide an delivery address"
    console.log("redirect to checkout page")
    // res.redirect("/checkout")
    res.json({ addressEmptyErr: true })
  } else {
    console.log("not worked")

    let products = await userHelpers.getCartProducts(req.session.user._id)
    let totalPrize = await userHelpers.getTotalAmount(req.session.user._id)
    let address = await userHelpers.getCheckoutAddress(req.body.checkbox, req.session.user._id)
    if (req.session.newAmount) {
      totalPrize = req.session.newAmount
    }
    //console.log(totalPrize)
    req.session.total = totalPrize
    //req.session.placeOrderData = req.body
    req.session.placeOrderData = address
    console.log("*****hai*****")
    console.log(address)

    userHelpers.placeOrder(address, products, totalPrize, req.body['payment-method']).then(async (orderId) => {
      req.session.orderId = orderId
      let couponId = req.session.couponId
      if (req.body['payment-method'] === "COD") {
        console.log("payment method is cod below is coupon id")
        console.log(couponId)
        await userHelpers.pushUsedCoupon(couponId, req.session.user._id)
        req.session.newAmount = null
        res.json({ codSuccess: true })
      } else if (req.body['payment-method'] === "RazorPay") {
        userHelpers.generateRazorpay(orderId, totalPrize).then((response) => {
          req.session.newAmount = null
          console.log(response.receipt)
          res.json({
            response: response,
            RazorpaySuccess: true
          })
        })
      } else if (req.body['payment-method'] === "Paypal") {
        console.log("userjs 418 paypal")
        val = totalPrize / 74,
          totalPrize = val.toFixed(2)
        totals = totalPrize.toString()
        console.log(totals)

        //response.totalPrize = parseInt(totalPrize)
        //response.paypal = true
        const create_payment_json = {
          "intent": "sale",
          "payer": {
            "payment_method": "paypal"
          },
          "redirect_urls": {
            "return_url": "https://www.itunesmobiles.xyz/payPalSuccess",
            "cancel_url": "https://www.itunesmobiles.xyz/payPalcancel"
          },
          "transactions": [{
            "item_list": {
              "items": [{
                "name": "cart Products",
                "sku": "001",
                "price": totals,
                "currency": "USD",
                "quantity": 1
              }]
            },
            "amount": {
              "currency": "USD",
              "total": totals
            },
            "description": "payment discription"
          }]
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
          if (error) {
            console.log("errr founded first step 1 of paypal")
            throw error;

          } else {
            console.log("step 1 paypal payment success")
            console.log(payment)
            console.log(payment.links)
            console.log(payment.links.length)
            for (let i = 0; i < payment.links.length; i++) {

              if (payment.links[i].rel === 'approval_url') {
                // res.redirect(payment.links[i].href);
                let url = payment.links[i].href
                console.log(url)
                // res.json({ response: url, PaypalSuccess: true })
                res.json({ url })
              } else {
                console.log("paypal failed")

              }
            }
          }
        });
      } else {
        console.log("payment Error occured userjs 492")
        res.redirect('/login')
      }
    })
  }


})
router.get("/payPalSuccess", verifyLogin, (req, res) => {
  console.log("paypal success step1")
  let val = {}
  if (req.session.newAmount) {
    val = req.session.newAmount
  } else {

    val = req.session.total
  }
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId

  val = val / 74
  let total = val.toFixed(2)
  console.log(val)
  console.log(payerId)
  console.log(paymentId)

  var execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": total
      }
    }]
  };
  paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {

    if (error) {
      console.log("paypal execute state erro 1")
      console.log(error.response);
      throw error;
    } else {
      console.log("Get Payment Response");
      console.log(req.session.user._id)
      console.log(req.session.placeOrderData)
      let placeOrderData = req.session.placeOrderData
      let id = req.session.user._id
      let products = await userHelpers.getCartProducts(id)
      let totalPrize = await userHelpers.getTotalAmount(id)
      if (req.session.newAmount) {
        totalPrize = req.session.newAmount
      }
      //console.log(JSON.stringify(payment));
      console.log(placeOrderData)
      console.log(products)
      console.log(totalPrize)
      // userHelpers.placeOrder(placeOrderData, products, totalPrize).then((orderId) => {
      userHelpers.clearcart(id)
      console.log("insertded id is")
      orderId = req.session.orderId
      console.log(orderId)
      userHelpers.changePaymentStatus(orderId).then(async () => {
        req.session.orderId = null
        req.session.newAmount = null
        console.log("paypal payment successfull and this is the inside of the change payment status")
        await userHelpers.stockValueChangePaypal(orderId)
        //order detail in succes page
        let orderDetails = await userHelpers.orderDetail(id)
        let userDetail = await userHelpers.getUserDetails(req.session.user)
        let total = 0
        for (x of orderDetails) {
          x.orderProduct.subtotal = x.orderProduct.Prize * x.Products.quantity
          total += x.orderProduct.subtotal
        }
        let orderDate = orderDetails[0].Date
        let orderAmount = orderDetails[0].Prize
        let grandTotal = total
        //
        let cartCount = null
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        let allBanner = await userHelpers.getBannerItems()
        //let orderDetails = await userHelpers.orderDetail(req.session.user._id)
        //let userDetail = await userHelpers.getUserDetails(req.session.user)
        req.session.placeOrderData = null
        res.render('user/success', { "layout": "user/layout", user: req.session.user, allBanner, cartCount, orderDetails, orderDate, orderAmount, grandTotal, userDetail })
      })
      // })
    }
  });
})
router.get("/payPalcancel", async (req, res) => {

  //  let id = req.session.user._id
  //  let val = req.session.total
  //  let placeOrderData = req.session.placeOrderData
  //  let products = await userHelpers.getCartProducts(id)
  //  let totalPrize = await userHelpers.getTotalAmount(id)
  //  userHelpers.placeOrder(placeOrderData,products,totalPrize).then((insertedId)=>{
  //    user.userHelpers.changePaymentStatus(insertedId).then()
  //  })

  res.redirect("/checkout")
})
router.post("/verify-payment", (req, res) => {
  console.log("insidie verify payment")
  console.log(req.body)
  console.log(req.body['order[receipt]'])
  //  console.log(req.body.order.receipt)
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {//check what is reciept format
      console.log(req.body['order[receipt]'])
      console.log("payment successfull")
      res.json({ status: true })
      req.session.orderId = null
    })
  }).catch((err) => {
    console.log("payment Failed")
    console.log(err)
    res.json({ status: false, errMsg: "payment Faild" })
  })
})


// checkout Ends



// shop more start
router.get('/shop', allCategory, async (req, res) => {
  let allBanner = await userHelpers.getBannerItems()
  let allProduct = await userHelpers.getAllProduct()
  let brand = await userHelpers.getBrand()
  let cartCount = null
  let proAvalble = true
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)

  }
  res.render('user/shop', { 'layout': 'user/layout', allProduct, allBanner, user: req.session.user, cartCount, category: res.data, brand, proAvalble })
})
// shop more end 


// wishlist start
router.get('/wishlist', verifyLogin, allCategory, async (req, res) => {

  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)

  }
  let wishListItems = await userHelpers.getWishlistItems(req.session.user._id)
  if (wishListItems.length != 0) {

    res.render('user/wishlist', { 'layout': 'user/layout', wishListItems, user: req.session.user, cartCount, category: res.data })
  } else {
    res.render('user/wishlist', { 'layout': 'user/layout', user: req.session.user, cartCount, category: res.data })

  }

})
router.get("/add-to-wishlist/:id", verifyLogin, (req, res) => {
  console.log("wishlist called")
  console.log(req.params.id)
  console.log(req.session.user._id)
  if (req.session.user) {
    userHelpers.addToWishList(req.params.id, req.session.user._id).then((response) => {
      //console.log(response)
      // console.log("above")
      if (response.productPresent) {

        res.json({ status: true, user: true })
      } else {
        res.json({ status: false, user: true })
      }

    })
  } else {
    res.json({ user: false })
  }


})

// wishlist ends


// order list page start
router.get('/orderHistory', verifyLogin, allCategory, async (req, res) => {
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let orderDetails = await userHelpers.getOrderDetails(req.session.user._id)
  for (x of orderDetails) {
    x.Date = moment(x.Date).format('lll');
  }
  res.render('user/orderhistory', { 'layout': 'user/layout', orderDetails, user: req.session.user, cartCount, category: res.data })
})

router.get('/orderDetails/:id', verifyLogin, allCategory, cartcountFun, async (req, res) => {
  console.log("the req.params.id is: " + req.params.id)
  let orderDetail = await userHelpers.orderDetails(req.session.user._id, req.params.id)
  console.log("order details")
  console.log(orderDetail)
  for (x of orderDetail) {
    x.Date = moment(x.Date).format('lll')
  }
  console.log(orderDetail[0].Status)
  let canceled = false
  if (orderDetail[0].Status == "canceled") {
    canceled = true;
  }
  res.render("user/orderDetails", { "layout": "user/layout", orderDetail, category: res.data, user: req.session.user, cartCount: res.cartCount })
})

//canel product
router.get("/cancelProduct/:id", async (req, res) => {
  console.log(req.params.id)
  await userHelpers.cancelProduct(req.params.id)
  res.redirect("/orderHistory")
})
// order list page ends 

// success page
router.get("/success", verifyLogin, allCategory, async (req, res) => {
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let allBanner = await userHelpers.getBannerItems()
  let orderDetails = await userHelpers.orderDetail(req.session.user._id)
  let userDetail = await userHelpers.getUserDetails(req.session.user)
  console.log("below is order detail")
  console.log(orderDetails)
  console.log("below is date")

  let total = 0
  for (x of orderDetails) {
    x.orderProduct.subtotal = x.orderProduct.Prize * x.Products.quantity
    total += x.orderProduct.subtotal
  }
  let orderDate = orderDetails[0].Date
  let orderAmount = orderDetails[0].Prize
  let grandTotal = total

  res.render("user/success", { "layout": 'user/layout', user: req.session.user, allBanner, orderDetails, userDetail, cartCount, orderDate, orderAmount, category: res.data, grandTotal })
})



// product details page
router.get("/productdetail/:id", allCategory, async (req, res) => {
  let cartCount = null
  let allProduct = await userHelpers.getAllProduct()
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let productId = req.params.id;
  await userHelpers.getSingleProduct(productId).then((singleProduct) => {
    console.log(singleProduct)
    res.render('user/productdetail', {
      "layout": 'user/layout', user: req.session.user,
      singleProduct, category: res.data, cartCount, allProduct
    })

  })
})




//fetch api
router.get("/find-product-in-wishlist", async (req, res) => {
  if (req.session.user) {
    let proId = await userHelpers.findProducts(req.session.user._id)
    console.log(proId)
    res.json(proId)
  }

})


// apply coupen 
router.post("/applyCoupon", async (req, res) => {
  console.log(req.body.couponData)

  let id = req.session.user._id
  let couuponCode = req.body.couponData
  let totalPrize = await userHelpers.getTotalAmount(id)
  userHelpers.checkCoupon(couuponCode, id).then((response) => {
    console.log("haii")
    console.log(response)
    if (response.coupon) {

      req.session.couponId = response.coupon._id

      if (response.used) {
        res.json({ couponIsValid: true, usedCoupon: true })
      } else {
        let couponValue = response.coupon.couponOffer
        req.session.newAmount = (totalPrize - totalPrize * couponValue / 100).toFixed(0)
        couponTotal = req.session.newAmount
        res.json({ couponIsValid: true, couponTotal: couponTotal, couponValue: couponValue })
      }
    } else {
      res.json({ couponIsValid: false })
    }
  })
})


router.get("/getCategory/:name", allCategory, cartcountFun, async (req, res) => {
  let allBanner = await userHelpers.getBannerItems()
  userHelpers.getCategoryProduct(req.params.name).then((catProduct) => {
    res.render("user/categoryProductDetail", { "layout": "user/layout", catProduct, allBanner, category: res.data, user: req.session.user, cartCount: res.cartCount })
  })
})

// get brands
router.get("/singleBrand/:brandname", allCategory, cartcountFun, async (req, res) => {
  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let brandProduct = await userHelpers.getBrandProduct(req.params.brandname)
  res.render("user/singlebrand", {
    "layout": "user/layout", allBanner, brandProduct, category: res.data, user: req.session.user,
    brandName: req.params.brandname, cartCount: res.cartCount, brand
  })

})

// add new Address
router.get("/addNewAddress", verifyLogin, (req, res) => {
  res.render("user/add-newAddress", { "layout": "user/layout", user: req.session.user })
})
//add new address
router.post("/addNewAddress", verifyLogin, (req, res) => {
  let user_id = req.session.user._id
  userHelpers.addAddress(req.body).then(() => {
    res.redirect("/checkout")
  })
})

router.get("/clearcart", verifyLogin, (req, res) => {
  console.log("cart 2")
  let id = req.session.user._id
  userHelpers.clearcart(id).then((response) => {
    res.json({ status: true })
  })
})

router.get("/changePassword/:id", verifyLogin, allCategory, cartcountFun, (req, res) => {
  let userId = req.params.id
  userHelpers.getUser(userId).then((userData) => {
    res.render("user/change-password", {
      "layout": "user/layout", user: req.session.user, userData,
      "changePasswordErr": req.session.changePasswordErr, "changePasswordSuccess": req.session.changePasswordSuccess, category: res.data, cartCount: res.cartCount
    })
    req.session.changePasswordErr = null
    req.session.changePasswordSuccess = null
  })
})

router.post("/changePassword/:id", (req, res) => {
  let userId = req.params.id
  let data = req.body
  userHelpers.changePassword(userId, data).then((response) => {
    console.log(response)
    if (response.status) {
      req.session.changePasswordSuccess = "* Password changed successfully "
      res.redirect("/changePassword/" + req.session.user._id)
    } else {
      req.session.changePasswordErr = "* Entered Password does not match with old password"
      res.redirect("/changePassword/" + req.session.user._id)
    }
  })
})

router.get("/SearchResult", allCategory, async (req, res) => {
  console.log("the search item is " + req.query.q)
  let data = req.query.q
  let allProduct = await userHelpers.searchProduct(data)
  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let cartCount = null
  let proAvalble = true
  if(allProduct.length==0){
    proAvalble = false
  }
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)

  }
  res.render("user/shop", { "layout": "user/layout", allProduct, allBanner, brand, cartCount, category: res.data, proAvalble,name:req.query.q })

})

router.get("/getMemory/:rom", allCategory, async (req, res) => {

  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  userHelpers.productRom(req.params.rom).then((allProduct) => {
    let proAvalble = true
    if (allProduct.productNotAvalble) {
      proAvalble = false
    }
    console.log(proAvalble)
    res.render("user/shop", { "layout": "user/layout", allProduct, allBanner, brand, cartCount, category: res.data, proAvalble })
  })
})

// sorting of prodouct
router.get("/sortAtoZ", async (req, res) => {

  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let proAvalble = true
  userHelpers.sortAtZ().then((allProduct) => {
    res.render("user/shop", { "layout": "user/layout", allProduct, allBanner, brand, cartCount, category: res.data, proAvalble })
  })
})
router.get("/sortZtoA", async (req, res) => {

  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let proAvalble = true
  userHelpers.sortZtA().then((allProduct) => {
    res.render("user/shop", { "layout": "user/layout", allProduct, allBanner, brand, cartCount, category: res.data, proAvalble })
  })
})
router.get("/sortPrizelow", async (req, res) => {

  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let proAvalble = true
  userHelpers.sortPrizelow().then((allProduct) => {
    res.render("user/shop", { "layout": "user/layout", allProduct, allBanner, brand, cartCount, category: res.data, proAvalble })
  })
})
router.get("/sortPrizehigh", async (req, res) => {

  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let cartCount = null
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let proAvalble = true
  userHelpers.sortPrizehigh().then((allProduct) => {
    res.render("user/shop", { "layout": "user/layout", allProduct, allBanner, brand, cartCount, category: res.data, proAvalble })
  })
})

//sorting in brandPage
router.get('/alphabaticalyA-Z/:brandName', allCategory, cartcountFun, async (req, res) => {
 
  let brand = await userHelpers.getBrand()
  userHelpers.alphabaticalyAZ(req.params.brandName).then((brandProduct) => {
    res.render("user/singlebrand", {
      "layout": "user/layout",  brandProduct, category: res.data, user: req.session.user,
      brandName: req.params.brandName, cartCount: res.cartCount, brand
    })
  })
})
router.get('/alphabaticalyZ-A/:brandName', allCategory, cartcountFun, async (req, res) => {
 
  let brand = await userHelpers.getBrand()
  userHelpers.alphabaticalyZA(req.params.brandName).then((brandProduct) => {
    res.render("user/singlebrand", {
      "layout": "user/layout",  brandProduct, category: res.data, user: req.session.user,
      brandName: req.params.brandName, cartCount: res.cartCount, brand
    })
  })
})
router.get("/prizeL-H/:brandName", allCategory, cartcountFun, async (req, res) => {
 
  let brand = await userHelpers.getBrand()
  userHelpers.prizeLH(req.params.brandName).then((brandProduct) => {
    res.render("user/singlebrand", {
      "layout": "user/layout",  brandProduct, category: res.data, user: req.session.user,
      brandName: req.params.brandName, cartCount: res.cartCount, brand
    })
  })
})
router.get('/prizeH-L/:brandName',allCategory, cartcountFun, async (req,res)=>{
  let brand = await userHelpers.getBrand()
  userHelpers.prizeHL(req.params.brandName).then((brandProduct) => {
    res.render("user/singlebrand", {
      "layout": "user/layout",  brandProduct, category: res.data, user: req.session.user,
      brandName: req.params.brandName, cartCount: res.cartCount, brand
    })
  })
})


//sorting in searchPage output
router.get('/alphabaticalyA-Zsearch/:name', allCategory, cartcountFun, async (req, res) => {
  console.log(req.params.name)
  console.log("haiii")
  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let proAvalble = true
  userHelpers.alphabaticalyAZsearch(req.params.name).then((allProduct) => {
    res.render("user/shop", {
      "layout": "user/layout",allBanner,  allProduct, category: res.data, user: req.session.user,
      name: req.params.name, cartCount: res.cartCount, brand,proAvalble
    })
  })
})
router.get('/alphabaticalyZ-Asearch/:name', allCategory, cartcountFun, async (req, res) => {
  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let proAvalble = true
  userHelpers.alphabaticalyZAsearch(req.params.name).then((allProduct) => {
    res.render("user/shop", {
      "layout": "user/layout",allBanner,  allProduct, category: res.data, user: req.session.user,
      name: req.params.name, cartCount: res.cartCount, brand,proAvalble
    })
  })
})
router.get("/prizeL-Hsearch/:name", allCategory, cartcountFun, async (req, res) => {
  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let proAvalble = true
  userHelpers.prizeLHsearch(req.params.name).then((allProduct) => {
    res.render("user/shop", {
      "layout": "user/layout",allBanner,  allProduct, category: res.data, user: req.session.user,
      name: req.params.name, cartCount: res.cartCount, brand,proAvalble
    })
  })
})
router.get('/prizeH-Lsearch/:name',allCategory, cartcountFun, async (req,res)=>{
  let allBanner = await userHelpers.getBannerItems()
  let brand = await userHelpers.getBrand()
  let proAvalble = true
  userHelpers.prizeHLsearch(req.params.name).then((allProduct) => {
    res.render("user/shop", {
      "layout": "user/layout", allBanner, allProduct, category: res.data, user: req.session.user,
      name: req.params.name, cartCount: res.cartCount, brand,proAvalble
    })
  })
})



module.exports = router;
