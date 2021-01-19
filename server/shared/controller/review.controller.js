const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const catagory = require("../models/category.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const { response } = require("../../config/express")
const shop = require("../models/shop.model")
const user = require("../models/user.model")
const { param } = require("../routes/ad.router")

function create(req, res) {

    params = req.body

    const record = review.build({
        body: params.body,
        rating: params.rating,
        userId: params.user_id,
        shopId: params.shop_id
    });
    record.save().then((record) => {
        review.findByPk(record.id, {
            include: [
                { model: shop }, { model: user }
            ]
        }).then((record) => { return apiRes.apiSuccess(res, [record], "Success", ) })

    })
}


function get(req, res) {
    review.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            review.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }, {
                    model: user
                }]
            }).then(record => {
                return apiRes.apiSuccess(res, [record], "success")
            })
        } else {
            return apiRes.apiError(res, "review is not pressent with this id")
        }

    })

}

function del(req, res) {
    review.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "Review ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    const record = review.update({
        body: params.body,
        rating: params.rating,
        userId: params.user_id,
        shopId: params.shop_id
    }, { where: { id: req.params.id } });

    review.findOne({
        where: { id: req.params.id },
        include: [{
            model: shop
        }, {
            model: user
        }]
    }).then(record => {
        return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
    })

}

function getAll(req, res) {

    review.findAll({
        include: [{
            model: shop
        }, { model: user }]
    }).then((reviews) => {
        return apiRes.apiSuccess(res, reviews, "success")
    })
}

function getReviewsByShopId(req, res) {
    review.findAll({
        where: { shopId: req.body.shop_id },
        include: [{
            model: shop
        }, { model: user }]
    }).then((reviews) => {
        return apiRes.apiSuccess(res, reviews, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll,
    getReviewsByShopId
}