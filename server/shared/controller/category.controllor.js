const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const category = require("../models/category.model")
const shop = require("../models/shop.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const { response } = require("../../config/express")

function create(req, res) {

    params = req.body

    value = category.findAll({
        where: {
            name: params.name
        }
    }).then(record => {
        console.log(record.length)
        if (record.length > 0) {
            apiRes.apiError(
                res, "Category already exists.", null)
        } else {

            if (req.files && req.files.icon) {
                var image = req.files.icon
                var img_url = "/category_icon/" + "_" + params.name + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Icon does't uploaded sucessfully.", err)
                });

            }

            const record = category.build({
                name: params.name,
                icon: img_url,
                description: params.description
            });
            return record.save().then((record) => {
                apiRes.apiSuccess(res, [record], "Success", )
            })
        }
    }).catch(error => console.log(error))

}

function get(req, res) {
    category.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            category.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })
        } else {
            return apiRes.apiError(res, "Category is not pressent with this id")
        }

    })

}

function del(req, res) {
    category.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "Category ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    category.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            if (req.files && req.files.icon) {
                var image = req.files.icon
                var img_url = "/category_icon/" + "_" + params.name + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = category.update({
                name: params.name,
                icon: img_url,
                description: params.description
            }, { where: { id: req.params.id } });

            category.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })

        } else {
            return apiRes.apiError(res, "Category is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    category.findAll().then((categories) => {
        return apiRes.apiSuccess(res, categories, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}