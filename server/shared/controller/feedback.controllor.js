const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const catagory = require("../models/category.model")
const ad = require("../models/ad.model")
const feedback = require("../models/feedback.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const { response } = require("../../config/express")
const shop = require("../models/shop.model")
const user = require("../models/user.model")
const { param } = require("../routes/ad.router")

function create(req, res) {

    params = req.body

    const record = feedback.build({
        title: params.title,
        body: params.body,
        userId: params.user_id,
        shopId: params.shop_id
    });
    record.save().then((record) => {
        feedback.findByPk(record.id, {
            include: [
                { model: shop }, { model: user }
            ]
        }).then((record) => { return apiRes.apiSuccess(res, [record], "Success", ) })

    })
}


function get(req, res) {
    feedback.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            feedback.findOne({
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
            return apiRes.apiError(res, "feedback is not pressent with this id")
        }

    })

}

function del(req, res) {
    feedback.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "feedback ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    const record = feedback.update({
        title: params.title,
        body: params.body,
        userId: params.user_id,
        shopId: params.shop_id
    }, { where: { id: req.params.id } });

    feedback.findOne({
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

    feedback.findAll({
        include: [{
            model: shop
        }, { model: user }]
    }).then((feedbacks) => {
        return apiRes.apiSuccess(res, feedbacks, "success")
    })
}


module.exports = {
    create,
    get,
    del,
    update,
    getAll
}