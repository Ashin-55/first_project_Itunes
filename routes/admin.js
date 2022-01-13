const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers')
const userHelpers = require('../helpers/user-helpers')
var moment = require('moment');
const { parse } = require('handlebars');

const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.render('admin/dashboard',{'layout':'admin/layout',admin:false})
// });
router.get('/', verifyLogin, async function (req, res, next) {

  let totalOrders = await productHelpers.getTotalOrderCount()
  let totalUser = await productHelpers.getTotalUserCount()
  let totalCanceledOrder = await productHelpers.getCanceledOrdersCount()
  let totalAmmout = await productHelpers.getTotalAmountOrder()
  let totalSale = totalAmmout[0].totals
  let recentOrder = await productHelpers.getrecentOrder()
  let cod = await productHelpers.getCODcount()
  let razorpay = await productHelpers.getRazorpayCount()
  let paypal = await productHelpers.getPaypalCount()
  let topBrandSaleCount = await productHelpers.getBrandSaleCount()

 console.log(recentOrder)

  let brandName = []
  let brandCount = []

  for (x of topBrandSaleCount) {
    brandName.push(x._id)
  }
  for (x of topBrandSaleCount) {
    brandCount.push(x.count)
  }

  for (x of recentOrder) {
    x.Date = moment(x.Date).format('lll')
  }

  res.render('admin/dashboard', {
    'layout': 'admin/layout',
    admin: false, totalOrders, totalUser,totalSale, totalCanceledOrder,  recentOrder,
    cod, razorpay, paypal, brandName, brandCount
  })
});

// admin login starts
router.get('/login', (req, res) => {

  if (req.session.admin) {
    res.redirect('/admin/')
  } else {
    res.render('admin/login', { 'layout': 'admin/layout' })
  }

});
router.post('/login', (req, res) => {
  console.log(req.body)
  userHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response
      console.log("first step of admin:" + response)
      req.session.admin.loggedIn = true
      res.redirect('/admin')
    } else {
      res.redirect('/admin/login')
    }
  })
})
// admin login ends

// add product start
router.get('/add-product', verifyLogin, async (req, res) => {
  let brand = await userHelpers.getBrand()
  productHelpers.getCategory().then((category) => {
    res.render('admin/add-product', { 'layout': 'admin/layout', admin: req.session.admin, category, brand })

  })
})

router.post('/add-product', verifyLogin, (req, res) => {
  console.log(req.body)

  req.body.Prize = parseInt(req.body.Prize)
  req.body.LandingCost = parseInt(req.body.LandingCost)
  req.body.Quantity = parseInt(req.body.Quantity)


  productHelpers.addProduct(req.body).then((id) => {
    console.log(req.body)

    let image1 = req.files.Image1;
    let image2 = req.files.Image2;
    let image3 = req.files.Image3
    let image4 = req.files.Image4;


    image1.mv('./public/product-image/' + id + "_1.png", (err1, done) => {
      // console.log("11")
      if (!err1) {
        // console.log("22");
        image2.mv('./public/product-image/' + id + "_2.png", (err2, done) => {
          if (!err2) {
            //     console.log("33");
            image3.mv('./public/product-image/' + id + "_3.png", (err3, done) => {
              if (!err3) {
                //       console.log("44");
                image4.mv('./public/product-image/' + id + "_4.png", (err4, done) => {
                  if (!err4) {

                    res.redirect('/admin/add-product')
                  } else {
                    console.log("the error is" + err4)
                  }
                })
              }
            })
          }
        })


      } else {
        console.log('the err is' + err1)
      }
    })


  })
})
// add produuct ends

// view all product start
router.get('/view-allProduct', verifyLogin, (req, res) => {
  productHelpers.getAllProduct().then((product) => {
    res.render('admin/view-allProduct', { 'layout': 'admin/layout', admin: req.session.admin, product })
  })
})
// view all product ends

// edit product start
router.get('/edit-product/:id', verifyLogin, async (req, res) => {
  let productId = req.params.id
  let product = await productHelpers.getProductDetials(productId)
  let category = await productHelpers.getCategory()
  let brand = await userHelpers.getBrand()
  res.render('admin/edit-product', { 'layout': "admin/layout", admin: req.session.admin, product, brand, category })
})

router.post('/edit-product/:id', verifyLogin, (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin/view-allProduct')
    let image1 = req.files.Image1
    let image2 = req.files.Image2
    let image3 = req.files.Image3
    let image4 = req.files.Image4

    if (req.files.Image1) {
      image1.mv('./public/product-image/' + req.params.id + '_1.png')
    }
    if (req.files.Image2) {
      image2.mv('./public/product-image/' + req.params.id + '_2.png')
    }
    if (req.files.Image3) {
      image3.mv('./public/product-image/' + req.params.id + '_3.png')
    }
    if (req.files.Image4) {
      image4.mv('./public/product-image/' + req.params.id + '_4.png')
    }
  })
})
// edit product ends

// delete product start
router.get('/delete-product/:id', verifyLogin, (req, res) => {
  let productId = req.params.id

  productHelpers.deleteProduct(productId).then((response) => {
    res.redirect('/admin/view-allProduct')
  })

})
// delete product ends

// view all users start
router.get('/view-allUser', verifyLogin, (req, res) => {
  productHelpers.getAllUser().then((allUser) => {
    res.render('admin/view-allUser', { 'layout': 'admin/layout', admin: req.session.admin, allUser })

  })
})
// view all user ends




// block user start
router.get('/block-user/:id', verifyLogin, (req, res) => {
  productHelpers.blockUser(req.params.id).then((response) => {
    res.redirect('/admin/view-allUser')
  })
})
// block user ends

//view blocked user start
router.get('/view-blockedUser', verifyLogin, (req, res) => {
  productHelpers.getBlockedUser().then((blockedUser) => {
    res.render('admin/view-blockedUser', { "layout": "admin/layout", admin: req.session.admin, blockedUser })
  })
})
// view blocked user ends


// banner managements starts
router.get('/banner', verifyLogin, (req, res) => {
  productHelpers.getBanner().then((banner) => {
    res.render('admin/banner', { 'layout': 'admin/layout', banner, admin: req.session.admin })
  })
})

router.post('/banner', verifyLogin, (req, res) => {

  productHelpers.addBanner(req.body).then((id) => {


    console.log("IMAGE COME TO HERE");

    if (req.files.bannerImage) {
      let image = req.files.bannerImage
      console.log("IMAGE IS PRESENT");
      image.mv('./public/admin/banner-image/' + id + '_1.jpg', (err, done) => {
        if (!err) {
          console.log("FILE IS MOVED");
          res.redirect('/admin/banner')
        } else {
          console.log("FILE NOT MOVED");
          console.log("THE ERROR IS" + err)
        }
      })
    } else {
      res.redirect('/admin/banner')
    }

  })
})

//  edit banner start
router.get('/edit-banner/:id', verifyLogin, async (req, res) => {
  let bannerId = req.params.id
  console.log("the id isssss" + bannerId);
  let banner = await productHelpers.getBannerDetails(bannerId)
  console.log(banner);
  res.render('admin/edit-banner', { "layout": "admin/layout", banner, admin: req.session.admin, })
})



router.post('/edit-banner/:id', (req, res) => {
  console.log("post edit id is" + req.params.id)
  console.log("edited data is " + req.body)
  productHelpers.editBanner(req.params.id, req.body).then((response) => {
    res.redirect('/admin/banner')
    let bannerImg = req.files.bannerImage

    if (req.files.bannerImage) {
      bannerImg.mv('./public/product-image/' + req.params.id + '_1.png')
    }

  })
})
// edit banner ends

// delete banner start
router.post('/delete-banner', verifyLogin, (req, res) => {
  productHelpers.deleteBanner(req.body.bannerId).then((response) => {
    res.json(response)
  })
})
// delete banner ends
// banner banner management ends



// ctegory start
router.get('/category', verifyLogin, (req, res) => {
  productHelpers.getCategory().then((category) => {

    res.render('admin/category', { 'layout': 'admin/layout', admin: req.session.admin, category })
  })
})

// add category starts
router.post('/category', verifyLogin, (req, res) => {
  console.log("enter here propery");
  productHelpers.addCategory(req.body).then(() => {
    res.redirect('/admin/category')
  })
})
// add category ends

// delete category start
router.post('/delete-category', verifyLogin, (req, res) => {
  productHelpers.deleteCategory(req.body.catId).then((response) => {
    res.json(response)
  })
})
// delete category ends
router.get("/edit-category/:id", verifyLogin, async (req, res) => {

  let categoryDetail = await productHelpers.getCategoryDetails(req.params.id)

  res.render('admin/edit-category', { "layout": "admin/layout", admin: req.session.admin, categoryDetail })
})
router.post("/edit-category/:id", (req, res) => {
  console.log("first")
  productHelpers.updateCategory(req.params.id, req.body).then((response) => {
    console.log("fourth")
    res.redirect('/admin/category')
  })
})
// category ends



// brand Management
router.get("/brand", verifyLogin, async (req, res) => {
  let brand = await productHelpers.getBrand()
  console.log("first" + brand)
  res.render('admin/brand', { 'layout': 'admin/layout', admin: req.session.admin, brand })
})
router.get("/addBrand", verifyLogin, (req, res) => {
  res.render("admin/add-brand", { "layout": "admin/layout", admin: req.session.admin, })
})

router.post('/addBrand', (req, res) => {
  productHelpers.addBrand(req.body).then((id) => {

    if (req.files.brandImage) {
      let image = req.files.brandImage

      image.mv("./public/brand-image/" + id + "_1.jpg", (err, done) => {
        if (!err) {
          res.redirect('/admin/brand')
        } else {
          console.log("err occured")
          console.log("err is" + err)
        }
      })
    } else {
      res.redirect('/admin/brand')
    }

  })
})

router.get('/editBrand/:id', verifyLogin, async (req, res) => {
  let brand = await productHelpers.getBrandDetails(req.params.id)
  res.render("admin/edit-brand", { "layout": "admin/layout", brand, admin: req.session.admin })
})
router.post("/editBrand/:id", (req, res) => {
  productHelpers.updateBrand(req.params.id, req.body).then((response) => {
    res.redirect("/admin/brand")

    if (req.files.brandImage) {
      let brandImg = req.files.brandImage
      brandImg.mv('/brand-image/' + req.params.id + "_1.jpg")
    }
  })
})
router.post("/deleteBrand", verifyLogin, (req, res) => {
  productHelpers.deleteBrand(req.body.brandId).then((response) => {
    res.json(response)
  })
})
router.get('/logout', (req, res) => {
  console.log("logout worked")
  req.session.admin = null
  res.redirect('/admin/login')
})


//order history
router.get("/orderHistory", verifyLogin, async (req, res) => {

  let allOrders = await productHelpers.getOrderHistory()
  for (x of allOrders) {
    x.Date = moment(x.Date).format("lll");
    console.log(x.Date)
  }
  console.log(allOrders)
  res.render("admin/view-allOrders", { "layout": "admin/layout", admin: true, allOrders, admin: req.session.admin })
})



//coupon offer
router.get('/coupon', verifyLogin, async (req, res) => {
  let coupon = await productHelpers.getAllCoupons()
  for (x of coupon) {
    x.expireAt = moment(x.expireAt).format('ll')
  }
  console.log(coupon)
  res.render("admin/coupon", { "layout": 'admin/layout', coupon, admin: req.session.admin })
})

// add coupon
router.post("/coupon", (req, res) => {
  console.log(req.body)
  req.body.couponOffer = parseInt(req.body.couponOffer)
  productHelpers.addCoupon(req.body).then((response) => {
    res.redirect("/admin/coupon")
  })
})
// deleteCoupon
router.post("/deleteCoupon", verifyLogin, (req, res) => {

  productHelpers.deleteCoupon(req.body.couponId).then((response) => {
    res.json(response)
  })
})


//Order Status changing----
router.get('/shipped/:id', (req, res) => {
  Status = 'shipped'
  productHelpers.changeOrderStatus(req.params.id, Status).then(() => {
    res.redirect('/admin/orderHistory')
  })
})
router.get('/delivered/:id', (req, res) => {
  Status = 'delivered'
  productHelpers.changeOrderStatus(req.params.id, Status).then(() => {
    res.redirect('/admin/orderHistory')
  })
})
router.get('/cancelled/:id', (req, res) => {
  Status = 'canceled'
  productHelpers.changeOrderStatus(req.params.id, Status).then(() => {
    res.redirect('/admin/orderHistory')
  })
})




// product report
router.get("/productReport", verifyLogin, async (req, res) => {
  let product = await productHelpers.productReport()
  console.log(product)
  res.render("admin/productReport", { "layout": "admin/layout", product, admin: req.session.admin })
})

// sales report
router.get("/salesReport", verifyLogin, async (req, res) => {
  let sales = await productHelpers.salesReport()
  console.log(sales.length)
  let report = true
  if (sales.length <= 0) {
    report = false
  }
  for (x of sales) {
    x.profit = (((x.singlePrize) * .20) * x.totalCount).toFixed(2);

  }
  console.log(sales)
  res.render("admin/sales-report", { "layout": 'admin/layout', admin: req.session.admin, sales, report, emptyErr: req.session.emptyErr })
  req.session.emptyErr = null
})


// category offer 
router.get("/categoryOffer", verifyLogin, async (req, res) => {
  let category = await productHelpers.getCategory()
  let categoryOffer = await productHelpers.getCategoryOffer()
  for (x of categoryOffer) {
    x.expireAt = moment(x.expireAt).format("ll")
  }
  res.render("admin/category-offer", {
    "layout": "admin/layout", category, categoryOffer,
    "catOfferPresent": req.session.catOfferPresentErr, admin: req.session.admin,
  })
  req.session.catOfferPresentErr = null
})

router.post("/categoryOffer", verifyLogin, (req, res) => {
  req.body.categoryOffer = parseInt(req.body.categoryOffer)
  productHelpers.addCategoryOffer(req.body).then((response) => {
    if (response.catofferPresent) {
      req.session.catOfferPresentErr = "Offer is allready present"
      res.redirect("/admin/categoryOffer")
    } else {
      res.redirect("/admin/categoryOffer")
    }
  })
})

router.post("/delete-categoryOffer", verifyLogin, (req, res) => {

  productHelpers.deleteCategoryOffer(req.body.offerId).then((response) => {
    res.json(response)
  })
})

// product offer
router.get("/productOffer", verifyLogin, async (req, res) => {
  let product = await productHelpers.getAllProduct()
  let category = await productHelpers.getCategory()
  let productOffer = await productHelpers.getAllProductOffers()
  for (x of productOffer) {
    x.expireAt = moment(x.expireAt).format("ll")
  }
  res.render("admin/product-offer", {
    "layout": "admin/layout", product,category, productOffer,
    "proOfferPresent": req.session.proOfferPresent, admin: req.session.admin,
    proOfferValueLess: req.session.proOfferValueLess
  })
  req.session.proOfferPresent = false
  req.session.proOfferValueLess=false
})

router.post("/productOffer", verifyLogin, (req, res) => {
  req.body.productOffer = parseInt(req.body.productOffer)
  productHelpers.addProductOffer(req.body).then((response) => {
    console.log("haii")
    console.log(response.proOffer)
    if (response.proOfferExists) {
      req.session.proOfferPresent = true
      res.redirect("/admin/productOffer")
    } else if (response.proOfferValueLess) {
      req.session.proOfferValueLess = "!! this product allredy have more offer value in category offersection"
      res.redirect("/admin/productOffer")
    } else {

      res.redirect("/admin/productOffer")
    }
  })
})

router.post("/deleteProductOffer", (req, res) => {
  productHelpers.deleteProOffer(req.body.offerId).then((response) => {
    res.json(response)
  })
})
router.post("/getDateSale", async (req, res) => {
  let from = req.body.startDate
  let to = req.body.endDate
  console.log(from, to)
  if (from == "" || to == "") {
    req.session.emptyErr = "** Date cant be empty"
    res.redirect("/admin/salesReport")
  } else {

    let sales = await productHelpers.getDateSalesReport(from, to)
    console.log("hai sales report")
    console.log(sales)
    for (x of sales) {
      x.profit = ((x.singlePrize) * .20).toFixed(2);
    }
    console.log(sales)
    let report = true
    if (sales.length <= 0) {
      report = false
    }
    console.log(report)
    res.render("admin/sales-report", { "layout": 'admin/layout', admin: req.session.admin, sales, report, from, to })

  }
})


router.post("/delete-product2", (req, res) => {
  console.log(req.body.productId)
  console.log(req.body.productId)
  console.log("delete product function called")
  productHelpers.delePro(req.body.productId).then((response) => {
    console.log("i think product is deleted")
    console.log(response)
    res.json(response)
  })
})
router.get("/crop", (req, res) => {

  res.render("xamples", { "layout": "admin/layout" })
})

module.exports = router;
