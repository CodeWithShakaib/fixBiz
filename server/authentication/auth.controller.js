// const admin = require("../shared/models/admin.model")
const apiRes = require("../config/api.response");
const { Op, where } = require("sequelize")

const catagory = require("../shared/models/category.model")
const shop = require("../shared/models/shop.model")
const ad = require("../shared/models/ad.model")
const review = require("../shared/models/review.model")
const service = require("../shared/models/service.model")
const gallery = require("../shared/models/gallery.model")
const fieldWorker = require("../shared/models/fieldWorker.model")
const user = require("../shared/models/user.model")
const city = require("../shared/models/city.model")
const subCategory = require("../shared/models/subCategory.model");
const shopSubCategory = require("../shared/models/shopSubCategory.model");

function signIn(req, res) {
    params = req.body

    if (params.type == 'USER') {
        user.count({ where: { phone_number: params.phone_number, password: params.password } }).then(count => {
            if (count != 0) {
                user.findOne({ where: { phone_number: params.phone_number, password: params.password } }).then(record => {
                    return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
                })
            } else {
                return apiRes.apiError(res, "Invalid phone number or password")
            }
        }).catch(err => {
            return apiRes.apiError(res, err.message)
        });;

    } else if (params.type == 'SHOP') {
        shop.count({ where: { phone_number: params.phone_number, password: params.password } }).then(count => {
            console.log(count)
            if (count != 0) {
                shop.findOne({
                    where: { phone_number: params.phone_number, password: params.password },
                    include: [{
                        model: catagory
                    }, {
                        model: fieldWorker
                    }, {
                        model: review,
                        include: [{ model: user }]
                    }, {
                        model: service
                    }, {
                        model: gallery
                    }, {
                        model: city
                    }, { model: ad }, {
                        model: shopSubCategory,
                        attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                        include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                    }]
                }).then(record => {
                    record = JSON.parse(JSON.stringify(record))
                    record.shopSubCategories = record.shopSubCategories.map(ele => ele.subCategory)
                    return apiRes.apiSuccess(res, [record], "success")
                }).catch(err => {
                    return apiRes.apiError(res, err.message)
                });
            } else {
                return apiRes.apiError(res, "Invalid phone number or password")
            }
        }).catch(err => {
            return apiRes.apiError(res, err.message)
        });

    } else if (params.type == 'ADMIN') {
        if (params.email == 'admin@gmail.com' && params.password == 'admin123') {
            return apiRes.apiSuccess(res, [], "success")
        } else {
            return apiRes.apiError(res, "Invalid email or password")
        }
    } else {
        return apiRes.apiError(res, "Invalid type, it must be USER, SHOP or ADMIN.")
    }

}

function changePassword(req, res) {
    let params = req.body;
    if (params.type == 'USER') {
        user.count({ where: { phone_number: params.phone_number } }).then((count) => {
            if (count != 0) {
                user.update({
                    password: params.new_password
                }, { where: { phone_number: params.phone_number } })
                return apiRes.apiSuccess(res, "Password changes sucessfully")
            }
            return apiRes.apiError(res, "User not found")
        }).catch(err => {
            return apiRes.apiError(res, err.message)
        });
    } else if (params.type == 'SHOP') {
        console.log(params.phone_number)
        shop.count({ where: { phone_number: params.phone_number } }).then((count) => {

            if (count != 0) {
                shop.update({ password: params.new_password }, { where: { phone_number: params.phone_number } })
                return apiRes.apiSuccess(res, null, "Password changes sucessfully")
            }
            return apiRes.apiError(res, "Shop not found")
        }).catch(err => {
            return apiRes.apiError(res, err)
        });
    } else {
        return apiRes.apiError(res, "Invalid type, it must be USER or SHOP")
    }

}

module.exports = {
    signIn,
    changePassword
}