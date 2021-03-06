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
const fs = require('fs');

function create(req, res) {

    params = req.body
    if (req.files && req.files.image) {
        var image = req.files.image
        var img_url = "/service_img/" + "_" + Date.now() + "_" + image.name.replace(' ', '_');

        image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
            if (err)
                return apiRes.apiError(
                    res, "Image does't uploaded sucessfully.", err)
        });

    }

    const record = service.build({
        name: params.name,
        description: params.description,
        img_url: img_url,
        orignal_price: params.orignal_price,
        discount: params.discount,
        shopId: params.shop_id
    });
    record.save().then((record) => {
        service.findByPk(record.id, {
            include: [
                { model: shop }
            ]
        }).then((record) => { return apiRes.apiSuccess(res, [record], "Success", ) })

    }).catch((err) => {
        return apiRes.apiSuccess(res, err.message)
    })
}


function get(req, res) {
    service.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            service.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }]
            }).then(record => {
                return apiRes.apiSuccess(res, [record], "success")
            })
        } else {
            return apiRes.apiError(res, "service is not pressent with this id")
        }

    })

}

async function del(req, res) {
    let data = await service.findByPk(req.params.id);
    if (data) {
        if (data.img_url)
            fs.unlinkSync(process.cwd() + '/server/public/' + data.img_url);
        console.log("image deleted")
    }
    service.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "Service ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body

    if (req.files && req.files.image) {
        var image = req.files.image
        var img_url = "/service_img/" + "_" + Date.now() + "_" + image.name;

        image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
            if (err)
                return apiRes.apiError(
                    res, "Image does't uploaded sucessfully.", err)
        });

    }

    const record = service.update({
        name: params.name,
        description: params.description,
        img_url: img_url,
        orignal_price: params.orignal_price,
        discount: params.discount,
        shopId: params.shop_id
    }, { where: { id: req.params.id } });

    service.findOne({
        where: { id: req.params.id },
        include: [{
            model: shop
        }]
    }).then(record => {
        return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
    })

}

function getAll(req, res) {

    service.findAll({
        include: [{
            model: shop
        }]
    }).then((services) => {
        return apiRes.apiSuccess(res, services, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}