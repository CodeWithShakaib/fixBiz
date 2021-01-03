const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const catagory = require("../models/category.model")
const shop = require("../models/shop.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const { response } = require("../../config/express")

function create(req, res) {

    params = req.body

    if (req.files && req.files.image) {
        var image = req.files.image
        var img_url = "/shop_img/" + "_" + Date.now() + "_" + image.name;

        image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
            if (err)
                return apiRes.apiError(
                    res, "Image does't uploaded sucessfully.", err)
        });

    }

    const record = shop.build({
        name: params.name,
        address: params.address,
        img_url: img_url,
        verification_status: false,
        transaction_id: params.transaction_id,
        transaction_amount: params.transaction_amount,
        transaction_method: params.transaction_method,
        longitude: params.longitude,
        latitude: params.latitude,
        opening_time: params.opening_time,
        closing_time: params.closing_time,
        userId: params.user_id,
        categoryId: params.category_id,
        fieldWorkerId: params.fieldWorker_id
    });
    return record.save().then((record) => {
        apiRes.apiSuccess(res, [record], "Success", )
    }).catch((err) => {
        return apiRes.apiError(res, err.message)

    })
}


function get(req, res) {
    shop.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            shop.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record], "success")
            })
        } else {
            return apiRes.apiError(res, "Shop is not pressent with this id")
        }

    })

}

function del(req, res) {
    shop.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "Shop ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    shop.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/shop_img/" + "_" + Date.now() + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = shop.update({
                name: params.name,
                address: params.address,
                img_url: img_url,
                verification_status: params.verification_status,
                transaction_id: params.transaction_id,
                transaction_amount: params.transaction_amount,
                transaction_method: params.transaction_method,
                longitude: params.longitude,
                latitude: params.latitude,
                opening_time: params.opening_time,
                closing_time: params.closing_time,
                userId: params.user_id,
                categoryId: params.category_id,
                fieldWorkerId: params.fieldWorker_id
            }, { where: { id: req.params.id } });

            shop.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })

        } else {
            return apiRes.apiError(res, "Shop is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    shop.findAll().then((shops) => {
        return apiRes.apiSuccess(res, shops, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}