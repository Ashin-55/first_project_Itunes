var collection = require('../config/collection')
var db = require('../config/connection')
var bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID
var ObjectId = require('mongodb').ObjectID
const { response } = require('../app')
const Razorpay = require('razorpay')
const paypal = require("paypal-rest-sdk")
const { resolve } = require('path')
const { USER_COLLECTTION } = require('../config/collection')

var instance = new Razorpay({
  key_id: 'rzp_test_l4MnWhgG3tqOLv',
  key_secret: 'kO2DwgQXK710bn3OflvO4YKW',
})





module.exports = {



  //get bannner
  getBannerItems: () => {
    return new Promise((resolve, reject) => {
      let banner = db.get().collection(collection.BANNER_COLLECTION).find().toArray()
      resolve(banner)
    })
  },

  getCategory: () => {
    return new Promise(async (resolve, reject) => {
      let category = await db.get().collection(collection.CATEGORY_COLLECTIION).find().toArray()

      resolve(category)
    })
  },


  //  admin login start
  adminLogin: (data) => {
    let response = {}
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ username: data.username })
      if (user) {
        //console.log(user);
        if (user.password === data.password) {
          console.log("admin login successfull")
          response.status = true;
          resolve(response)
        } else {
          console.log("password is wrong ")
          resolve({ status: false })
        }
      } else {
        console.log("Invalid Username");
        resolve({ status: false })
      }
    })
  },
  //  admin login end


  checkUser: (data) => {
    return new Promise(async (resolve, reject) => {
      let exists = false;
      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ mobilePhone: data })
      if (user) {
        exists = true
      }
      resolve(exists)
    })
  },


  // user signup start
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {

      userData.status = true
      userData.password = await bcrypt.hash(userData.password, 10)
      db.get().collection(collection.USER_COLLECTTION).insertOne(userData).then((data) => {
        resolve(data)
      })
    })
  },
  // user signup ends

  // user login start
  doLogin: (loginData) => {

    let response = {}

    return new Promise(async (resolve, reject) => {

      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ email: loginData.email })
      let mobileLogin = await db.get().collection(collection.USER_COLLECTTION).findOne({ mobilePhone: loginData.mobilePhone })
        ;
      if (user) {
        bcrypt.compare(loginData.password, user.password).then((status) => {
          if (status) {
            console.log("login successfull");
            //console.log(status)
            response.user = user
            response.status = true
            resolve(response)

          } else {
            console.log("Password incorrect , login Failed");
            resolve({ status: false })
          }
        })
      }
      else if (mobileLogin) {
        console.log("login successfull with otp login");
        //console.log(status)
        response.user = mobileLogin
        response.status = true
        resolve(response)
      }
      else {
        console.log("user not found Login Failed");
        resolve({ status: false })
      }
    })
  },
  // user login ends
  //login with mobilenumber
  mobileCheck: (data) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ mobilePhone: data.mobilePhone }).then((response) => {
        console.log("its mobilecheck (userhelper line 104) below its response")
        console.log(response)
        if (response) {
          console.log("userfound with same mobile number  2")

          response.status = true
          resolve(response)
        } else {
          console.log("user doesnot found with same mobile number  3")
          resolve({ status: false })
        }
      })
    })

  },


  // get all product

  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()


      resolve(product)

    })
  },


  //  cart  management start
  addToCart: (productId, userId) => {

    console.log("below is user id(user helpers 149)")
    //console.log(userId)

    let productObj = {
      item: objectId(productId),
      quantity: 1
    }
    return new Promise(async (resolve, reject) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

      if (userCart) {

        let productExist = userCart.products.findIndex(product => product.item == productId)
        // console.log(productExist)
        if (productExist != -1) {
          await db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
              {
                $inc: { 'products.$.quantity': 1 }
              }).then(() => {
                resolve()
              })
        } else {

          db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
            $push: {
              products: productObj
            }
          }).then((response) => {
            resolve()
          })
        }

      } else {

        let cartObj = {
          user: objectId(userId),
          products: [productObj]

        }

        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve(response)

        })
      }
    })
  },


  // buy now 
  buyNow: (productId, userId) => {
    let productObj = {
      item: objectId(productId),
      quantity: 1
    }
    return new Promise(async (resolve, rejecct) => {
      let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (userCart) {
        let productExist = userCart.products.findIndex(product => product.item == productId)
        // console.log(productExist)
        if (productExist != -1) {
          await db.get().collection(collection.CART_COLLECTION)
            .updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
              {
                $inc: { 'products.$.quantity': 0 }
              }).then(() => {
                resolve()
              })
        } else {

          db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
            $push: {
              products: productObj
            }
          }).then((response) => {
            resolve()
          })
        }

      } else {
        let cartObj = {
          user: objectId(userId),
          products: [productObj]
        }
        db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
          resolve(response)
        })
      }
    })
  },

  //  get cart product
  getCartPtoducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartProduct = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project:
          {
            item: "$products.item",
            quantity: "$products.quantity"
          }
        },
        {
          $lookup:
          {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $project: {

            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: 1,
            total: { $sum: { $multiply: ['$quantity', { $convert: { input: '$product.Prize', to: 'int' } }] } }
          }
        }
      ]).toArray()
      //  console.log("get cart product")
      //  console.log(cartProduct);
      //  console.log("below is cartProduct[0].product")
      // console.log(cartProduct[0].products);
      resolve(cartProduct)

    })

  },



  getCartCount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      if (cart) {
        count = cart.products.length
      }
      resolve(count)
    })
  },

  //  changeProductQuantity in database 
  changeProductQuantity: (details) => {
    console.log("step2 change product quantity")
    details.count = parseInt(details.count)
    details.quantity = parseInt(details.quantity)
    return new Promise((resolve, reject) => {

      if (details.count == -1 && details.quantity == 1) {
        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: objectId(details.cart) },
            {
              $pull: { products: { item: objectId(details.product) } }
            }).then((response) => {
              resolve({ removeProduct: true })
            })
      } else {

        db.get().collection(collection.CART_COLLECTION)
          .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) }, {
            $inc: { "products.$.quantity": details.count }
          }).then((response) => {
            resolve({ status: true })
          })
      }

    })
  },


  // remove item

  romoveProduct: (data) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(data.cart) }, {
        $pull: { products: { item: objectId(data.productId) } }
      }).then((response) => {
        resolve({ removeProduct: true })
      })
    })
  },
  removeWishlist: (data) => {
    console.log(data)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ _id: objectId(data.wishlist) }, {
        $pull: { items: { item: objectId(data.product) } }
      }).then((response) => {
        resolve({ removeProduct: true })
      })
    })
  },

  // get  product total value

  getTotalAmount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let product = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      console.log(product)
      let totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: "_id",
            as: 'product'
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $convert: { input: '$product.Prize', to: 'int' } }] } }
          }
        }

      ]).toArray()
      //  console.log(totalAmount)
      //  console.log(totalAmount[0].total)
      //  in case of change quantity total is notedifyned    
      //  if(product.products!=""){ 
      //   resolve(totalAmount[0].total)
      //  }else{
      //    resolve()
      //  }
      if (totalAmount.length == 0) {
        resolve()
      } else {
        resolve(totalAmount[0].total)
      }
    })
  },



  changeQuantityTotalAmount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let value = await db.get().collection(collection.CART_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item',
            quantity: '$products.quantity'
          }
        },
        {
          $lookup: {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: "_id",
            as: 'product'
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            product: { $arrayElemAt: ['$product', 0] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Prize' }] } }
          }
        }

      ]).toArray()
      console.log(value)
      if (value.length > 0) {
        resolve(value[0].total)
      } else {
        resolve(value[0])
      }
    })
  },

  //cart plus or minus cheyubole single productinte totl prize maaran change-product-quantityil vilicha function

  // changeSingleTotalAmount: (userId) => {
  //   return new Promise(async (resolve, reject) => {
  //     let cartProduct = await db.get().collection(collection.CART_COLLECTION).aggregate([
  //       {
  //         $match: { user: objectId(userId) }
  //       },
  //       {
  //         $unwind: '$products'
  //       },
  //       {
  //         $project:
  //         {
  //           item: "$products.item",
  //           quantity: "$products.quantity"
  //         }
  //       },
  //       {
  //         $lookup:
  //         {
  //           from: collection.PRODUCT_COLLECTION,
  //           localField: 'item',
  //           foreignField: '_id',
  //           as: 'product'
  //         }
  //       },
  //       {
  //         $project: {

  //           item: 1,
  //           quantity: 1,
  //           product: { $arrayElemAt: ['$product', 0] }
  //         }


  //       },
  //       {
  //         $project: {
  //           item: 1,
  //           quantity: 1,
  //           product: 1,
  //           total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Prize' }] } }
  //         }
  //       },
  //     ]).toArray()

  //     //  console.log('the result is '+cartProduct)
  //     //   console.log("second result is "+cartProduct)
  //     //  console.log("first"+cartProduct[0].total)
  //     //  console.log("second"+cartProduct[2].total)
  //     //  console.log("third"+cartProduct[0].total)


  //     //resolve(cartProduct)
  //   })
  // },


  //get cart products for check out

  getCartProducts: (userId) => {

    return new Promise(async (resolve, reject) => {

      let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
      console.log(cart)
      resolve(cart.products)
    })
  },

  //get checkout address
  getCheckoutAddress: (addressId, userId) => {
    return new Promise(async (resolve, reject) => {

      let address = await db.get().collection(collection.USER_COLLECTTION)
        .aggregate([
          {
            $match: { _id: objectId(userId) }
          },
          {
            $unwind: "$Contact"
          },
          {
            $match: { "Contact._id": objectId(addressId) }
          },
          {
            $project:
            {
              Contact: 1,
              _id: 1
            }
          }
        ]).toArray()
      //   console.log("%%%%%%%%")
      // console.log(address)
      resolve(address)

    })

  },


  //place order
  placeOrder: (order, products, totalPrize, paymentMethod) => {
    console.log("products")
    console.log(products)
    console.log("order")
    console.log(order)
    return new Promise((resolve, reject) => {
      // console.log(order.userid)
      // console.log(order._id)
      // console.log(order[0].Contact.userid)
      // console.log(order[0].Contact._id)
      // console.log("Payment methode is ")
      // console.log(paymentMethod)

      let status = paymentMethod === 'COD' ? 'placed' : 'pending';
      let orderObj = {

        billingDetails: {
          userId: objectId(order[0].Contact.userid),
          singleContactId: order[0].Contact._id,
        },
        UserId: objectId(order[0].Contact.userid),
        Prize: totalPrize,
        Products: products,
        Date: new Date(),
        Status: status,
        Paymentmethod: paymentMethod,

      }
      if (paymentMethod === 'COD') {
        db.get().collection(collection.ORDER_COLLETION).insertOne(orderObj).then(async (response) => {


          //update the stock of product
          for (x of products) {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(x.item) }, {
              $inc: {
                Quantity: -(x.quantity)
              }
            })
          }



          db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order[0].Contact.userid) })
          resolve(response.ops[0]._id)
        })
      } else if (paymentMethod === 'RazorPay') {
        console.log("payment method is razor pay")
        db.get().collection(collection.ORDER_COLLETION).insertOne(orderObj).then((response) => {
          console.log(orderObj)
          console.log(response)
          resolve(response.ops[0]._id)
        })
      } else if (paymentMethod === "Paypal") {
        console.log("payment methode is paypal")
        db.get().collection(collection.ORDER_COLLETION).insertOne(orderObj).then((response) => {
          console.log(orderObj)
          console.log(response)
          resolve(response.ops[0]._id)
        })
      } else {
        console.log("Payment method is no cleared")
        resolve()
      }
    })
  },
  //clear cart
  clearcart: (id) => {
    return new Promise((resolve, reject) => {

      db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(id) }).then((response) => {
        resolve(response)
      })
    })
  },




  //get single product
  getSingleProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      let singleProduct = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) })

      resolve(singleProduct)
    })
  },


  //brand management
  getBrand: () => {
    return new Promise(async (resolve, reject) => {
      let brand = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
      //console.log(brand)
      resolve(brand)
    })
  },
  // get rom
  productRom: (data) => {
    console.log(data)
    return new Promise(async (resolve, reject) => {
      let rom = await db.get().collection(collection.PRODUCT_COLLECTION).find({Rom:data}).toArray()
      if(rom){

        resolve(rom)
      }else{
        resolve({productNotAvalble:true})
      }
    })
  },



  //wishlist
  addToWishList: (productId, userId) => {
    console.log("step 1 user-helper 587")
    let productObj = {
      item: objectId(productId)
    }
    return new Promise(async (resolve, reject) => {
      console.log("step 2 user-helper 592")
      let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: objectId(userId) })

      if (userWishlist) {

        console.log("wishlist exists")
        let productExist = userWishlist.items.findIndex(
          element => element.item == productId

        )
        console.log(productExist)

        if (productExist != -1) {

          console.log("product is present")
          db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({ user: objectId(userId) },
              {
                $pull: { items: { item: objectId(productId) } }
              }).then((response) => {
                response.productPresent = true
                resolve(response)
              })

        } else {

          console.log("product does not exits")
          db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({ user: objectId(userId) }, {
              $push: { items: productObj }
            }).then((response) => {
              response.productPresent = false
              resolve(response)
            })
        }


      } else {
        console.log("step3 user-helper 602")
        let wishlistObj = {
          user: objectId(userId),
          items: [productObj]
        }
        db.get().collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishlistObj).then((response) => {
            response.productPresent = true
            resolve(response)
          })
      }
    })
  },

  getWishlistItems: (userId) => {

    return new Promise(async (resolve, reject) => {
      let wishlistItems = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
        {
          $match: { user: objectId(userId) }
        },
        {
          $unwind: "$items"
        },
        {
          $project:
          {
            item: "$items.item"
          }
        },
        {
          $lookup:
          {
            from: collection.PRODUCT_COLLECTION,
            localField: 'item',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: "$product"
        },
        {
          $project:
          {
            product: 1,

          }
        }
      ]).toArray()
      console.log("haiiiii")
      console.log(wishlistItems)
      resolve(wishlistItems)
    })

  },

  findProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      console.log('get pro called 4')
      let user = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
      let productId = []
      if (user) {
        for (x of user.items) {
          productId.push(x.item)
        }
        resolve(productId)


      } else {
        console.log("user not found")
        resolve()
      }
    })
  },


  //get user details
  getUserDetails: (userData) => {
    console.log(userData)
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: objectId(userData._id) })
      resolve(user)

    })
  },

  getSavedAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: objectId(userId) })

      if (user.Contact) {
        let userAddress = await db.get().collection(collection.USER_COLLECTTION).aggregate([
          {
            $match: { _id: objectId(userId) }
          },
          {
            $unwind: '$Contact'
          },
          {
            $project: { Contact: 1 }
          }
        ]).toArray()
        console.log(userAddress)
        resolve(userAddress)
      } else {
        resolve()
      }
    })
  },




  generateRazorpay: (orderId, total) => {
    return new Promise((resolve, reject) => {
      console.log("generate razor pay")
      var options = {
        amount: total * 100,
        currency: "INR",
        receipt: "" + orderId,

      };
      instance.orders.create(options, function (err, order) {
        console.log("enter to the instance orders")
        if (order) {
          console.log("new order:", order);
          console.log(order.receipt)
          resolve(order)

        } else {
          console.log(err)
        }
      });

    })
  },

  verifyPayment: (data) => {
    console.log(data)
    return new Promise(async (resolve, reject) => {
      let orderId = data['order[receipt]']
      console.log("hai this is this" + orderId)
      // get product id and its quantity for change stock value
      let productData = await db.get().collection(collection.ORDER_COLLETION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) }
          },
          {
            $unwind: "$Products"
          },
          {
            $project: {
              Products: 1
            }
          }
        ]).toArray()
      console.log("below is productdata")
      console.log(productData)
      let loopProducts = []
      for (x of productData) {
        loopProducts.push(x.Products)
      }
      console.log(loopProducts)

      let userId = await db.get().collection(collection.ORDER_COLLETION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) }
          },
          {
            $project: { UserId: 1, _id: 0 }
          }
        ]).toArray()
      console.log("below is razor pay verify paymennt")
      console.log(userId)
      let id = []
      for (x of userId) {
        id.push(x.UserId)
      }
      console.log("the user id is " + id)
      let ID = id.toString()
      console.log("^^^^^" + ID)
      console.log("it is user id in order collection" + ID)
      const crypto = require('crypto');
      let hmac = crypto.createHmac('sha256', 'kO2DwgQXK710bn3OflvO4YKW')
      hmac.update(data['payment[razorpay_order_id]'] + '|' + data['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex')
      if (hmac == data['payment[razorpay_signature]']) {
        console.log("inside the payment successfull is " + ID)
        //update the stock of product
        for (x of loopProducts) {
          console.log("hlw stock update checked kkkkkkkkkkkkkkkkkkk")
          await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(x.item) }, {
            $inc: {
              Quantity: -(x.quantity)
            }
          })
        }
        //
        await db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(ID) }).then((response) => {
          resolve()
        })
      } else {
        console.log("payment failed")
        db.get().collection(collection.ORDER_COLLETION)
          .updateOne({ _id: objectId(orderId) },
            {
              $set: {
                Status: "payment failed"
              }
            }).then((response) => {
              reject()
            })
      }
    })
  },

  changePaymentStatus: (orderId) => {
    console.log(orderId)
    return new Promise((resolve, reject) => {
      console.log("Enter to the change status")
      db.get().collection(collection.ORDER_COLLETION)
        .updateOne({ _id: objectId(orderId) }, {
          $set: {
            Status: "placed"
          }
        })
        .then((response) => {
          console.log(response)
          console.log("*************")
          resolve()
        })
    })
  },


  //in success page order detils
  orderDetail: (userId) => {
    return new Promise(async (resolve, reject) => {
      let data = await db.get().collection(collection.ORDER_COLLETION)
        .aggregate([
          {
            $match: { UserId: objectId(userId) }
          },
          {
            $sort: { Date: -1 }
          },
          {
            $limit: 1
          },
          {
            $unwind: "$Products"
          },
          {
            $project:
            {
              Firstname: 1,
              lastName: 1,
              Prize: 1,
              Products: 1,
              Date: 1,
              Status: 1,
              Country: 1,
              State: 1,
              Address: 1
            }
          },
          {
            $lookup:
            {
              from: collection.PRODUCT_COLLECTION,
              localField: "Products.item",
              foreignField: "_id",
              as: "orderProduct"
            }
          },
          {
            $unwind: "$orderProduct"
          },



        ]).toArray()
      console.log(data)
      resolve(data)
      //resolve(orderData)
    })
  },



  //order history
  getOrderDetails: (userId) => {
    return new Promise(async (resolve, reject) => {
      let orderData = await db.get().collection(collection.ORDER_COLLETION).aggregate([
        {
          $match: { UserId: objectId(userId) }
        },
        {
          $sort: { Date: -1 }
        },

      ]).toArray()
      resolve(orderData)
    })
  },

  //order product details
  orderDetails: (userId, orderId) => {
    return new Promise(async (resolve, reject) => {
      let productDetails = await db.get().collection(collection.ORDER_COLLETION)
        .aggregate([
          {
            $match:
            {
              UserId: objectId(userId)
            }
          },
          {
            $unwind: "$Products"
          },
          {
            $match: { _id: objectId(orderId) }
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "Products.item",
              foreignField: "_id",
              as: "orderProduct"
            }
          },
          {
            $unwind: "$orderProduct"
          },
          {
            $sort: { Date: -1 }
          }
        ]).toArray()
      resolve(productDetails)

    })
  },

  // cancel product
  cancelProduct: (orderId) => {
    console.log("the orderid is " + orderId)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.ORDER_COLLETION)
        .updateOne({ _id: objectId(orderId) }, {
          $set: {
            Status: "canceled",
            canceled: true
          }
        }).then((response) => {
          resolve(response)
        })
    })
  },



  // profile management
  getUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: objectId(userId) })
      resolve(user)
    })
  },

  addAddress: (userData) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTTION)
        .findOne({ _id: objectId(userData.userid) })
      userData._id = objectId()
      if (user.Contact) {
        db.get().collection(collection.USER_COLLECTTION)
          .updateOne({ _id: objectId(userData.userid) }, {
            $push: { Contact: userData }
          }).then((response) => {
            resolve(response)
          })
      } else {
        let dataObj = [userData]
        db.get().collection(collection.USER_COLLECTTION)
          .updateOne({ _id: objectId(userData.userid) }, {
            $set: { Contact: dataObj }
          }).then((response) => {
            resolve(response)
          })
      }
    })
  },

  getUserAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: objectId(userId) })
      console.log(user)
      if (user.Contact) {
        let address = user.Contact;
        resolve(address)
      } else {
        resolve()
      }
      // console.log("haiii4")
      // console.log(address)
    })
  },

  getUserOrder: (userId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collection.ORDER_COLLETION)
        .aggregate([
          {
            $match: { UserId: objectId(userId) }
          },
          {
            $sort: { Date: -1 }
          },
          {
            $limit: 6
          },
          {
            $unwind: "$Products"
          },
          {
            $lookup:
            {
              from: collection.PRODUCT_COLLECTION,
              localField: "Products.item",
              foreignField: "_id",
              as: "userProduct"
            }
          },
          {
            $unwind: "$userProduct"
          }
        ]).toArray()
      //console.log(order)
      resolve(order)
    })
  },

  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.get().collection(collection.ORDER_COLLETION)
        .aggregate([
          {
            $match: { UserId: objectId(userId) }
          }
        ]).toArray()
      resolve(order)
    })
  },

  deleteAddress: (addressId, userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTTION)
        .updateOne({ _id: objectId(userId) },
          {
            $pull: { Contact: { _id: objectId(addressId) } }
          }).then(() => {
            resolve()
          })
    })
  },
  //for edit addresss
  getAddressDetails: (addressId, userId) => {
    return new Promise(async (resolve, reject) => {
      console.log(addressId)

      let getdetails = await db.get().collection(collection.USER_COLLECTTION)
        .aggregate([
          {
            $match: { _id: userId }
          },
          {
            $unwind: "$Contact"
          },
          {
            $match: { "Contact._id": addressId }
          },
          {
            $project: {
              Contact: 1
            }
          }
        ]).toArray()
      console.log("haiiii1056")
      // console.log(getdetails)
      if (getdetails) {
        resolve(getdetails[0])
      } else {
        reject(err)
      }
    })
  },

  updateAddress: (data) => {
    return new Promise((resolve, reject) => {
      console.log("updateAddres")
      console.log(data)
      console.log(data._id)
      db.get().collection(collection.USER_COLLECTTION)
        .updateOne({ _id: objectId(data.userid), "Contact._id": objectId(data._id) }, {
          $set: {
            "Contact.$.firstName": data.firstName,
            "Contact.$.lastName": data.lastName,
            "Contact.$.email": data.email,
            "Contact.$.mobilePhone": data.mobilePhone,
            "Contact.$.address1": data.address1,
            "Contact.$.city": data.city,
            "Contact.$.pinCode": data.pinCode,
            "Contact.$.Country": data.Country,
            "Contact.$.state": data.state
          }
        }).then((response) => {
          resolve(response)
        })
    })
  },

  // profile update/edit
  updateUserProfile: (userId, userData) => {
    console.log(userId)
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTTION)
        .updateOne({ _id: objectId(userId) }, {
          $set:
          {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email
          }
        }).then((response) => {
          console.log(response)
          resolve(response.insertedId)
        })
    })
  },

  //check coupon valid
  checkCoupon: (couponData, userId) => {
    console.log("the coupon code is" + couponData)
    return new Promise(async (resolve, reject) => {
      let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: couponData })
      console.log(coupon)
      if (coupon) {
        let userUsed = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: objectId(userId), usedCouponId: objectId(coupon._id) })

        if (userUsed) {
          resolve({ coupon, used: true })
        } else {

          resolve({ coupon, used: false })
        }



      } else {
        console.log("the coupon data is " + coupon)
        resolve({ status: true })
      }
    })
  },
  //add used coupon to user collection
  pushUsedCoupon: (couponId, userId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.USER_COLLECTTION)
        .updateOne({ _id: objectId(userId) }, {
          $push: {
            usedCouponId: objectId(couponId)
          }
        }).then((response) => {
          resolve()
        })
    })
  },





  //get coupon value offer
  getCouponvalue: (couponData) => {
    console.log(couponData)
    return new Promise(async (resolve, reject) => {
      let value = await db.get().collection(collection.COUPON_COLLECTION).aggregate([
        {
          $match: { couponCode: (couponData) }
        },
        {
          $project: {
            _id: 0,
            couponOffer: 1
          }
        }
      ]).toArray()

      resolve(value[0].couponOffer)
    })
  },

  // check coupon is used or not
  checkUsedCoupon: (couponData, userId) => {
    return new Promise(async (resolve, reject) => {
      let checkCoupon = await db.get().collection(collection.USER_COLLECTTION)
        .findOne({ _id: objectId(userId), usedCoupon: { $elemMatch: { $eq: couponData } } })

      if (checkCoupon) {
        valid = true
        console.log(valid)
        resolve(valid)
      } else {
        valid = false
        console.log(valid)
        resolve(valid)
      }
    })
  },

  //add used cooupen in user collection
  addUsedCoupon: (coupon, userId) => {
    return new Promise(async (resolve, reject) => {
      let usedCoupens = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: ObjectId(userId) })

      if (usedCoupens.usedCoupon) {
        db.get().collection(collection.USER_COLLECTTION).updateOne({ _id: ObjectId(userId) },
          {
            $push: {
              usedCoupon: coupon
            }
          }).then(() => {
            resolve()
          })
      } else {
        db.get().collection(collection.USER_COLLECTTION).updateOne({ _id: ObjectId(userId) },
          {
            $set: {
              usedCoupon: [coupon]
            }
          }).then((usedCoupens) => {
            resolve(usedCoupens)
          })
      }
    })
  },

  // get category wise products
  getCategoryProduct: (Name) => {
    return new Promise(async (resolve, reject) => {
      let categoryProduct = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: Name }).toArray()
      resolve(categoryProduct)
    })
  },

  // get brand wise products
  getBrandProduct: (brandname) => {
    return new Promise(async (resolve, reject) => {
      let brandProduct = await db.get().collection(collection.PRODUCT_COLLECTION)
        .find({ brandName: brandname }).toArray()

      resolve(brandProduct)

    })
  },


  // stock changer
  stockValueChangePaypal: (orderId) => {
    return new Promise(async (resolve, reject) => {
      // get product id and its quantity for change stock value
      let productData = await db.get().collection(collection.ORDER_COLLETION)
        .aggregate([
          {
            $match: { _id: objectId(orderId) }
          },
          {
            $unwind: "$Products"
          },
          {
            $project: {
              Products: 1
            }
          }
        ]).toArray()
      console.log("below is productdata")
      console.log(productData)
      let loopProducts = []
      for (x of productData) {
        loopProducts.push(x.Products)
      }

      //update the stock of product
      for (x of loopProducts) {
        await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(x.item) }, {
          $inc: {
            Quantity: -(x.quantity)
          }
        })
      }
      //
      resolve()
    })
  },

  // change password
  changePassword: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      let user = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: objectId(userId) })

      if (user) {
        bcrypt.compare(data.oldPassword, user.password).then(async (status) => {
          if (status) {
            data.newPassword = await bcrypt.hash(data.newPassword, 10)
            db.get().collection(collection.USER_COLLECTTION).updateOne({ _id: objectId(userId) }, {
              $set: {
                password: data.newPassword
              }
            }).then((response) => {

              console.log("password changed")
              console.log(user)
              response.user = user
              response.status = true
              resolve(response)
            })
          } else {
            console.log("user enter invalid password")
            resolve({ status: false })
          }
        })
      } else {
        console.log("something when to wrong in change password")
        resolve()
      }
    })
  },


  // search product
  searchProduct: (data) => {
    console.log(data)
    return new Promise(async (resolve, reject) => {
      let output = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Name: { $regex: `^${data}`,$options:'i' } }).toArray()
      resolve(output)
    })
  },

  // sort product by alphabettalli globaly
  sortAtZ:()=>{
    return new Promise(async(resolve,reject)=>{
  let output =await    db.get().collection(collection.PRODUCT_COLLECTION)
       .aggregate([
         {
           $sort:{Name:1}
         }
       ]).toArray()
       resolve(output)
    })
  },
  sortPrizelow:()=>{
    return new Promise(async(resolve,reject)=>{
  let output =await    db.get().collection(collection.PRODUCT_COLLECTION)
       .aggregate([
         {
           $sort:{Prize:-1}
         }
       ]).toArray()
       resolve(output)
    })
  },
  sortZtA:()=>{
    return new Promise(async(resolve,reject)=>{
  let output =await    db.get().collection(collection.PRODUCT_COLLECTION)
       .aggregate([
         {
           $sort:{Name:-1}
         }
       ]).toArray()
       resolve(output)
    })
  },
  sortPrizelow:()=>{
    return new Promise(async(resolve,reject)=>{
  let output =await    db.get().collection(collection.PRODUCT_COLLECTION)
       .aggregate([
         {
           $sort:{Prize:1}
         }
       ]).toArray()
       resolve(output)
    })
  },
  sortPrizehigh:()=>{
    return new Promise(async(resolve,reject)=>{
  let output =await    db.get().collection(collection.PRODUCT_COLLECTION)
       .aggregate([
         {
           $sort:{Prize:-1}
         }
       ]).toArray()
       resolve(output)
    })
  },
 
  //sort product in brand page
  alphabaticalyAZ:(brand)=>{
    return new Promise(async(resolve,reject)=>{
      let result =  await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{brandName:brand}
          },
          {
            $sort:{Name:1}
          }
        ]).toArray()
        console.log(result)
        resolve(result)
    })
  },
  alphabaticalyZA:(brand)=>{
    return new Promise(async(resolve,reject)=>{
      let result =  await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{brandName:brand}
          },
          {
            $sort:{Name:-1}
          }
        ]).toArray()
        console.log(result)
        resolve(result)
    })
  },

  prizeLH:(brand)=>{
    return new Promise( async(resolve,reject)=>{
      let result = await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{brandName:brand}
          },
          {
            $sort:{Prize:1}
          }
        ]).toArray()
        console.log(result)
        resolve(result)
    })
  },
  prizeHL:(brand)=>{
    return new Promise( async(resolve,reject)=>{
      let result = await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{brandName:brand}
          },
          {
            $sort:{Prize:-1}
          }
        ]).toArray()
        console.log(result)
        resolve(result)
    })
  },
  // sort Product in search output
  alphabaticalyAZsearch:(name)=>{
    console.log("come to search input a-z "+name)
    return new Promise(async(resolve,reject)=>{
      let result =  await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{Name: { $regex: `^${name}`,$options:'i' } }
          },
          {
            $sort:{Name:1}
          }
        ]).toArray()
        console.log("below is result")
        console.log(result)
        resolve(result)
    })
  },
  alphabaticalyZAsearch:(name)=>{
    return new Promise(async(resolve,reject)=>{
      let result =  await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{ Name: { $regex: `^${name}`,$options:'i' } }
          },
          {
            $sort:{Name:-1}
          }
        ]).toArray()
        console.log(result)
        resolve(result)
    })
  },

  prizeLHsearch:(name)=>{
    return new Promise( async(resolve,reject)=>{
      let result = await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{Name: { $regex: `^${name}`,$options:'i' } }
          },
          {
            $sort:{Prize:1}
          }
        ]).toArray()
        console.log(result)
        resolve(result)
    })
  },
  prizeHLsearch:(name)=>{
    return new Promise( async(resolve,reject)=>{
      let result = await db.get().collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match:{Name: { $regex: `^${name}`,$options:'i' } }
          },
          {
            $sort:{Prize:-1}
          }
        ]).toArray()
        console.log(result)
        resolve(result)
    })
  }
}