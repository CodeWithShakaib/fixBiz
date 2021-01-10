const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const city = require("../models/city.model")
const shop = require("../models/shop.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const { response } = require("../../config/express")

function create(req, res) {

    params = req.body

    value = city.findAll({
        where: {
            name: params.name
        }
    }).then(record => {
        console.log(record.length)
        if (record.length > 0) {
            apiRes.apiError(
                res, "City already exists.", null)
        } else {


            const record = city.build({
                name: params.name,
                description: params.description
            });
            return record.save().then((record) => {
                apiRes.apiSuccess(res, [record], "Success", )
            })
        }
    }).catch(error => console.log(error))

}

function get(req, res) {
    city.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            city.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })
        } else {
            return apiRes.apiError(res, "City is not pressent with this id")
        }

    })

}

function del(req, res) {
    city.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "City ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    city.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {

            const record = city.update({
                name: params.name,
                description: params.description
            }, { where: { id: req.params.id } });

            city.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })

        } else {
            return apiRes.apiError(res, "City is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    city.findAll().then((cities) => {
        return apiRes.apiSuccess(res, cities, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}