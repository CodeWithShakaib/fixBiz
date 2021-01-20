// const admin = require("../shared/models/admin.model")
const apiRes = require("../config/api.response");
const { Op } = require("sequelize")

const catagory = require("../shared/models/category.model")
const shop = require("../shared/models/shop.model")
const ad = require("../shared/models/ad.model")
const review = require("../shared/models/review.model")
const service = require("../shared/models/service.model")
const gallery = require("../shared/models/gallery.model")
const fieldWorker = require("../shared/models/fieldWorker.model")
const user = require("../shared/models/user.model")
const city = require("../shared/models/city.model")

function signIn(req, res) {
    params = req.body

    if (params.type == 'USER') {
        user.count({ where: { email: params.email, password: params.password } }).then(count => {
            if (count != 0) {
                user.findOne({ where: { email: params.email, password: params.password } }).then(record => {
                    return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
                })
            } else {
                return apiRes.apiError(res, "Invalid email or password")
            }
        });

    } else if (params.type == 'SHOP') {
        shop.count({ where: { email: params.email, password: params.password } }).then(count => {
            if (count != 0) {
                shop.findOne({
                    where: { email: params.email, password: params.password },
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
                    }, { model: ad }]
                }).then(record => {
                    return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
                })
            } else {
                return apiRes.apiError(res, "Invalid email or password")
            }
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

module.exports = {
    signIn
}