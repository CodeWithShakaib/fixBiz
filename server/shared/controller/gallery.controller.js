const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const catagory = require("../models/category.model")
const ad = require("../models/ad.model")
cgallery = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const { response } = require("../../config/express")
const shop = require("../models/shop.model")
const user = require("../models/user.model")
const { param } = require("../routes/ad.router")

function create(req, res) {

    params = req.body
    if (req.files && req.files.image) {
        var image = req.files.image
        var img_url = "/gallery_img/" + "_" + Date.now() + "_" + image.name;

        image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
            if (err)
                return apiRes.apiError(
                    res, "Image does't uploaded sucessfully.", err)
        });

    }

    const record = gallery.build({
        title: params.title,
        img_url: img_url,
        shopId: params.shop_id
    });
    record.save().then((record) => {
        gallery.findByPk(record.id, {
            include: [
                { model: shop }
            ]
        }).then((record) => { return apiRes.apiSuccess(res, [record], "Success", ) })

    })
}


function get(req, res) {
    gallery.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            gallery.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }]
            }).then(record => {
                return apiRes.apiSuccess(res, [record], "success")
            })
        } else {
            return apiRes.apiError(res, "gallery is not pressent with this id")
        }

    })

}

function del(req, res) {
    gallery.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "gallery ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body

    if (req.files && req.files.image) {
        var image = req.files.image
        var img_url = "/gallery_img/" + "_" + Date.now() + "_" + image.name;

        image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
            if (err)
                return apiRes.apiError(
                    res, "Image does't uploaded sucessfully.", err)
        });

    }

    const record = gallery.update({
        body: params.body,
        rating: params.body,
        userId: params.user_id,
        shopId: params.shop_id
    }, { where: { id: req.params.id } });

    gallery.findOne({
        where: { id: req.params.id },
        include: [{
            model: shop
        }]
    }).then(record => {
        return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
    })

}

function getAll(req, res) {

    gallery.findAll({
        include: [{
            model: shop
        }]
    }).then((galleries) => {
        return apiRes.apiSuccess(res, galleries, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}