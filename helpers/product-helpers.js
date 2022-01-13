var objectId = require('mongodb').ObjectID
var db = require('../config/connection')
var collection = require('../config/collection')
const { response } = require('express')

module.exports = {


    // product add
    addProduct: (product) => {
        product.LandingCost = parseInt(product.LandingCost)
        product.Prize = parseInt(product.Prize)
        product.Quantity = parseInt(product.Quantity)
        console.log(product)

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    // product add ends

    // get all product from data base
    getAllProduct: () => {
        return new Promise((resolve, reject) => {
            let product = db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    // get all product from database ends

    // delete product start
    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) }).then((response) => {
                resolve(response._id)
            })
        })
    },
    // delete product ends

    // get product details start
    getProductDetials: (productId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((product) => {
                resolve(product)
            })
        })
    },
    // get product product details ends

    // update product start
    updateProduct: (productId, productData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(productId) }, {
                $set: {
                    Name: productData.Name,
                    Discription: productData.Discription,
                    Category: productData.Category,
                    LandingCost: parseInt(productData.LandingCost),
                    Prize: parseInt(productData.Prize),
                    Quantity: parseInt(productData.Quantity),
                    Color: productData.Color
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    // update product Ends



    // banner management start
    getBanner: () => {
        return new Promise((resolve, reject) => {
            let banner = db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },

    addBanner: (bannerData) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(bannerData).then((response) => {
                console.log("banner returns response" + response);
                resolve(response.insertedId)
            })
        })
    },



    // banner edit start
    getBannerDetails: (bannerid) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: objectId(bannerid) }).then((response) => {
                console.log("the banner is");

                resolve(response)

            })
        })
    },

    editBanner: (bannerId, newBannerData) => {
        return new Promise((resolve, reject) => {
            console.log("enter to edit banner function in producthelpers")
            db.get().collection(collection.BANNER_COLLECTION).updateOne({ _id: objectId(bannerId) }, {

                $set: {
                    Name: newBannerData.Name,
                    Discription: newBannerData.Discription,
                    Option: newBannerData.Option
                }
            }).then((response) => {
                console.log("edited response is" + response);
                resolve(response)
            })
        })
    },
    // banner edit ends
    // banner delete start
    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve({ removeBanner: true })
            })
        })
    },
    // banner delete ends


    // banner management ends


    // category mangement
    addCategory: (categoryData) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.CATEGORY_COLLECTIION).insertOne(categoryData).then((response) => {
                console.log("the response issss" + response);
                resolve(response)
            })
        })
    },

    getCategory: () => {
        return new Promise((resolve, reject) => {
            let category = db.get().collection(collection.CATEGORY_COLLECTIION).find().toArray()
            resolve(category)
        })
    },

    deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTIION).deleteOne({ _id: objectId(categoryId) }).then((response) => {
                resolve({ removeCategory: true })
            })
        })
    },
    getCategoryDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTIION).findOne({ _id: objectId(id) })
            resolve(category)
        })
    },
    updateCategory: (id, data) => {
        console.log("second")
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTIION).updateOne({ _id: objectId(id) }, {
                $set: {
                    Name: data.Name
                }
            }).then((response) => {
                console.log("third")

                resolve()
            })
        })
    },

    // category management








    //============user side=============//

    // get all user start
    getAllUser: () => {
        return new Promise((resolve, reject) => {
            let user = db.get().collection(collection.USER_COLLECTTION).find().toArray()
            resolve(user)
        })
    },
    // get all user ends



    // block user start
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {

            let blockUser = await db.get().collection(collection.USER_COLLECTTION).findOne({ _id: objectId(userId) })

            if (!blockUser.status) {

                value = blockUser.status = true
            } else {

                value = blockUser.status = false
            }

            db.get().collection(collection.USER_COLLECTTION).updateOne({ _id: objectId(userId) }, { $set: { status: (value) } }).then((response) => {
                resolve(response)
            })
        })
    },
    // block user ends

    // view blocked user start
    getBlockedUser: () => {
        return new Promise((resolve, reject) => {
            let blockedUser = db.get().collection(collection.USER_COLLECTTION).find({ status: false }).toArray()
            console.log(blockedUser);
            resolve(blockedUser)
        })
    },
    // view blocked user ends


    //  brand mangement
    addBrand: (brandData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).insertOne(brandData).then((response) => {
                resolve(response.insertedId)
            })
        })
    },
    getBrand: () => {
        return new Promise(async (resolve, reject) => {
            let brand = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            console.log(brand)
            resolve(brand)
        })
    },
    getBrandDetails: (brandId) => {
        return new Promise(async (resolve, reject) => {
            let brand = await db.get().collection(collection.BRAND_COLLECTION).findOne({ _id: objectId(brandId) }).then((response) => {
                resolve(response)
            })
        })
    },
    updateBrand: (brandId, brandData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({ _id: objectId(brandId) }, {
                $set: {
                    brandName: brandData.brandName,
                    brandDiscription: brandData.brandDiscription
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    deleteBrand: (brandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: objectId(brandId) }).then((response) => {
                resolve({ removeBrand: true })
            })
        })
    },



    //order history
    getOrderHistory: () => {
        return new Promise(async (resolve, reject) => {
            let orderData = await db.get().collection(collection.ORDER_COLLETION)
                .aggregate([
                    {
                        $sort: { Date: -1 }
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
                            as: "orderProducts"
                        }
                    },
                    {
                        $unwind: "$orderProducts"
                    },
                    {
                        $lookup:
                        {
                            from: collection.USER_COLLECTTION,
                            localField: "UserId",
                            foreignField: "_id",
                            as: "userDetails"
                        }
                    },
                    {
                        $unwind: "$userDetails"
                    }
                ]).toArray()

            resolve(orderData)

        })
    },


    // add coupon
    addCoupon: (coupon) => {
        coupon.expireAt = new Date(coupon.expireAt)
        console.log(coupon)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon)
            db.get().collection(collection.COUPON_COLLECTION).createIndex({ "expireAt": 1 }, { expireAfterSeconds: 0 }).then((response) => {
                resolve(response)
            })
        })
    },

    // get all coupon
    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    //  delete coupon
    deleteCoupon: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(id) }).then((response) => {
                resolve({ removeCoupon: true })
            })
        })
    },

    //Change order status by admin page by admin and Status passes from admin page
    changeOrderStatus: (orderId, stat) => {
        return new Promise((resolve, reject) => {
            console.log(stat, "in change");
            if (stat == "delivered") {
                db.get().collection(collection.ORDER_COLLETION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        Status: stat,
                        Delivered: true
                    }
                }).then(() => {
                    resolve()
                })
            } else if (stat == "canceled") {
                db.get().collection(collection.ORDER_COLLETION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        Status: stat,
                        canceled: true
                    }
                }).then(() => {
                    resolve()
                })
            } else {
                db.get().collection(collection.ORDER_COLLETION).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        Status: stat
                    }
                }).then(() => {
                    resolve()
                })
            }
        })
    },



    // get count of total orders
    getTotalOrderCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLETION).count().then((response) => {
                resolve(response)
            })
        })
    },

    // get count of user
    getTotalUserCount: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTTION).count().then((response) => {
                resolve(response)
            })
        })
    },

    // get cancel order count
    getCanceledOrdersCount: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLETION).find({ Status: "canceled" }).toArray()
            // console.log(order)
            // console.log(order.length)
            resolve(order.length)
        })
    },


    // get total prize  of all orders
    getTotalAmountOrder: () => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLETION)
                .aggregate([
                    {
                        $group: {
                            _id: null,
                            totals: { $sum: "$Prize" }
                        }
                    },


                ]).toArray()
            resolve(total)
        })
    },

    // get recent orders
    getrecentOrder: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLETION)
                .aggregate([
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
                            as: "productDetail"
                        }
                    },
                    {
                        $unwind: "$productDetail"
                    },
                    {
                        $lookup:
                        {
                            from: collection.USER_COLLECTTION,
                            localField: "billingDetails.userId",
                            foreignField: "_id",
                            as: "userDetail"
                        }
                    },
                    {
                        $unwind: "$userDetail"
                    },
                    {
                        $project:
                        {
                            Date: 1,
                            Status: 1,
                            Paymentmethod: 1,
                            productDetail: 1,
                            userDetail: 1,
                        }
                    }
                ]).toArray()
            resolve(order)
        })
    },


    //  get cod count
    getCODcount: () => {
        return new Promise(async (resolve, reject) => {
            let cod = await db.get().collection(collection.ORDER_COLLETION)
                .find({ Paymentmethod: 'COD' }).toArray()

            // console.log(cod)
            // console.log(cod.length)
            resolve(cod.length)
        })
    },
    // get paypal count
    getRazorpayCount: () => {
        return new Promise(async (resolve, reject) => {
            let razorpay = await db.get().collection(collection.ORDER_COLLETION)
                .find({ Paymentmethod: 'RazorPay' }).toArray()

            // console.log(razorpay)
            // console.log(razorpay.length)
            resolve(razorpay.length)
        })
    },
    //   get razorpay count
    getPaypalCount: () => {
        return new Promise(async (resolve, reject) => {
            let paypal = await db.get().collection(collection.ORDER_COLLETION)
                .find({ Paymentmethod: 'Paypal' }).toArray()

            // console.log(paypal)
            // console.log(paypal.length)
            resolve(paypal.length)
        })
    },
    // get Brand wise sale
    getBrandSaleCount: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLETION)
                .aggregate([
                    {
                        $unwind: '$Products'
                    },
                    {
                        $lookup:
                        {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "Products.item",
                            foreignField: "_id",
                            as: "productDetails"

                        }
                    },
                    {
                        $unwind: "$productDetails"
                    },
                    {
                        $group:
                        {
                            _id: "$productDetails.brandName",
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { count: -1 }
                    },
                    {
                        $limit: 3
                    }
                ]).toArray()
            console.log(order)
            resolve(order)
        })
    },

    // get product report
    productReport: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },

    // get sales report
    salesReport: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLETION)
                .aggregate([
                    {
                        $unwind: "$Products"
                    },
                    {
                        $lookup:
                        {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "Products.item",
                            foreignField: "_id",
                            as: "productDetail"
                        }
                    },
                    {
                        $unwind: "$productDetail"
                    },
                    {
                        $group:
                        {
                            _id: "$productDetail.Name",
                            totalCount: { $sum: 1 },
                            totalPrize: { $sum: "$productDetail.Prize" },
                            productId: { $first: "$productDetail._id" },
                            singlePrize: { $first: "$productDetail.Prize" },

                        }
                    },


                ]).toArray()

            resolve(sales)
            console.log(sales)

        })
    },
    //sorted sales report
    getDateSalesReport: (start, end) => {

        return new Promise(async (resolve, reject) => {
            let report = await db.get().collection(collection.ORDER_COLLETION)
                .aggregate([
                    {
                        $match: { Date: { $gte: new Date(start), $lt: new Date(end) } }
                    }, {
                        $unwind: "$Products"
                    },
                    {
                        $lookup:
                        {
                            from: collection.PRODUCT_COLLECTION,
                            localField: "Products.item",
                            foreignField: "_id",
                            as: "productDetail"
                        }
                    },
                    {
                        $unwind: "$productDetail"
                    },
                    {
                        $group:
                        {
                            _id: "$productDetail.Name",
                            totalCount: { $sum: 1 },
                            totalPrize: { $sum: "$productDetail.Prize" },
                            productId: { $first: "$productDetail._id" },
                            singlePrize: { $first: "$productDetail.Prize" },

                        }
                    },
                    {
                        $sort: { Date: -1 }
                    }
                ]).toArray()
            console.log("haiii")
            console.log(report)
            resolve(report)

        })
    },

    // add category offer
    addCategoryOffer: (data) => {
        console.log("below is add category offer")
        console.log(data)
        let catName = data.categoryName
        let catOffer =  data.categoryOffer
        console.log(catName)
        console.log(catOffer)
        data.expireAt = new Date(data.expireAt)
        return new Promise(async (resolve, reject) => {
            let catOfferCheck = await db.get().collection(collection.CATEGORY_OFFER).findOne({ categoryName: data.categoryName })
            let productOffer = await db.get().collection(collection.PRODUCT_OFFER).find({ categoryName: data.categoryName }).toArray()
            console.log(catOfferCheck)
            console.log(productOffer)
            console.log("execpwte offer")
            let productName = []
            for (x of productOffer) {
                productName.push(x.productName)
            }
            console.log(productName)


            if (!catOfferCheck) {

                db.get().collection(collection.CATEGORY_OFFER).insertOne(data).then(async (response) => {
                    if (productOffer != "") {
                        console.log("product offer is not null")
                        var product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: catName, Name: { $nin: productName } }).toArray()
                        console.log(productOffer[0].productName)
                        console.log("the result is")
                        console.log(product)
                    } else {
                        console.log("product offer is null")
                        var product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: catName }).toArray()
                        console.log("the result i s s s s")
                        console.log(product)
                    }

                    var bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp();

                    var count = 0;
                    let result = await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: catName, Name: { $nin: productName } }).forEach(function (doc) {
                        console.log("welcome")
                        console.log(doc)

                        console.log(catName)
                        bulkOp.find({ '_id': doc._id, }).updateOne({
                            '$set': {
                                'offer': true,
                                'oldPrize': parseInt(doc.Prize),
                                'value': catOffer,
                                'Prize': (parseInt(doc.Prize) - parseInt(doc.Prize * catOffer / 100)).toFixed(0)
                            }
                        })
                        count++;
                        if (count % product.length === 0) {
                            console.log("second")
                            console.log(product.length)
                            bulkOp.execute();
                            bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp();
                        }
                    })
                    console.log("hlw eveyone")
                    console.log(result)
                    // if (count > 0) {
                    //     console.log("third")
                    //     bulkOp.execute();
                    // }
                    console.log(product)
                    resolve(response)
                })
            } else {
                console.log("catoffer bbbb present")
                resolve({ catofferPresent: true })
            }
        })
    },

    getCategoryOffer: () => {
        return new Promise(async (resolve, reject) => {
            console.log("get category offer called")
            let categoryOffer = await db.get().collection(collection.CATEGORY_OFFER).find().toArray()
            console.log(categoryOffer)
            resolve(categoryOffer)
        })
    },

    deleteCategoryOffer: (catOfferId) => {
        return new Promise(async (resolve, reject) => {
            let offerdata = await db.get().collection(collection.CATEGORY_OFFER).findOne({ _id: objectId(catOfferId) })
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Category: offerdata.categoryName })
            let productOffer = await db.get().collection(collection.PRODUCT_OFFER).find({ categoryName: offerdata.categoryName }).toArray()
            let productName = []
            for (x of productOffer) {
                productName.push(x.productName)
            }
            db.get().collection(collection.CATEGORY_OFFER)
                .deleteOne({ _id: objectId(catOfferId) }).then(async (response) => {
                    let product = db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: offerdata.categoryName }).toArray()

                    var bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp();
                    var count = 0;
                    await db.get().collection(collection.PRODUCT_COLLECTION).find({ Category: offerdata.categoryName, Name: { $nin: productName } }).forEach(function (doc) {
                        bulkOp.find({ _id: doc._id }).updateOne({
                            $set: {
                                offer: false,
                                Prize:parseInt(doc.oldPrize)
                            }
                        })
                        count++;
                        if (count % product.length === 0) {
                            bulkOp.execute();
                            bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp();
                        }
                    })
                    if (count > 0) {
                        console.log("third")
                        bulkOp.execute();
                    }
                    resolve({ removeCatOffer: true })
                })
        })
    },

    // product offer
    addProductOffer: (data) => {
        data.expireAt = new Date(data.expireAt)
        console.log(data)
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Name: data.productName })
            let productOffer = await db.get().collection(collection.PRODUCT_OFFER).findOne({ productName: data.productName })
            let catoffer = await db.get().collection(collection.CATEGORY_OFFER).findOne({ categoryName: data.categoryName })
            console.log(catoffer)

            if (!productOffer) {
                if (!catoffer) {

                    db.get().collection(collection.PRODUCT_OFFER).insertOne(data).then(async (response) => {
                        console.log("!catoffer" + product)
                        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Name: data.productName }, {

                            $set:
                            {
                                offer: true,
                                oldPrize: product.Prize,
                                value: data.productOffer,
                                Prize: parseInt((product.Prize - product.Prize * data.productOffer / 100))
                            }
                        })
                        console.log(data.productOffer)
                        console.log(product.Prize)
                        resolve(response)
                    })
                } else {
                    if (data.productOffer > catoffer.categoryOffer) {
                        console.log("!catoffer" + product)
                        db.get().collection(collection.PRODUCT_OFFER).insertOne(data).then(async (response) => {
                            console.log("!catoffer" + product)
                            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Name: data.productName }, {

                                $set:
                                {
                                    offer: true,
                                    oldPrize: parseInt(product.oldPrize),
                                    value: parseInt(data.productOffer),
                                    Prize: parseInt((product.oldPrize - product.oldPrize * data.productOffer / 100)).toFixed(0)
                                }
                            })
                            console.log(data.productOffer)
                            console.log(product.Prize)
                            console.log(product.oldPrize)
                            resolve(response)
                        })
                    } else {
                        console.log("give offer is lesserthan compaired to category offer value")
                        resolve({ proOfferValueLess: true })
                    }
                }

            } else {
                console.log("product offer is present ")

                resolve({ proOfferExists: true })
            }
        })
    },
    getAllProductOffers: () => {
        return new Promise(async (resolve, reject) => {
            let proOffer = await db.get().collection(collection.PRODUCT_OFFER).find().toArray()
            resolve(proOffer)
        })
    },

    deleteProOffer: (offerId) => {
        return new Promise(async (resolve, reject) => {
            let offerdata = await db.get().collection(collection.PRODUCT_OFFER).findOne({ _id: objectId(offerId) })
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Name: offerdata.productName })
            console.log(product)
            db.get().collection(collection.PRODUCT_OFFER)
                .deleteOne({ _id: objectId(offerId) }).then((response) => {
                    db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ Name: offerdata.productName }, {
                        $set: {
                            offer: false,
                            //    Prize:(parseInt(product.Prize)+parseInt(product.oldPrize*product.value/100)).toFixed(0)
                            Prize: parseInt(product.oldPrize)
                        }
                    })
                    resolve({ removeProOffer: true })
                }).catch((err) => {
                    console.log(err)
                })


        })
    },

    delePro: (proid) => {
        return new Promise(async (resolve, reject) => {
            console.log(proid)
            console.log(proid.productId)
            await db.get().collection(collection.PRODUCT_COLLECTION)
                .deleteOne({ _id: objectId(proid) }).then((response) => {
                    console.log(response)
                    console.log("product deletede")
                    resolve({ removeProduct: true })
                })
        })
    }






}