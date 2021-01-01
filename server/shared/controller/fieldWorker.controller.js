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

    value = fieldWorker.findAll({
        where: {
            [Op.or]: [
                { cnic: params.cnic },
                { phone_number: params.phone_number }
            ]
        }
    }).then(record => {
        console.log(record.length)
        if (record.length > 0) {
            apiRes.apiError(
                res, "CNIC or phone number already exists.", null)
        } else {

            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/fieldWorker_profile_img/" + "_" + params.cnic + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = fieldWorker.build({
                f_name: params.f_name,
                l_name: params.l_name,
                cnic: params.cnic,
                address: params.address,
                img_url: img_url,
                phone_number: params.phone_number,
                gender: params.gender
            });
            return record.save().then((record) => {
                apiRes.apiSuccess(res, record, "Success", )
            })
        }
    }).catch(error => console.log(error))

}

function get(req, res) {
    fieldWorker.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            fieldWorker.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, record.get({ plain: true }), "success")
            })
        } else {
            return apiRes.apiError(res, "Field Worker is not pressent with this id")
        }

    })

}

function del(req, res) {
    fieldWorker.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "Field Worker ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    fieldWorker.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/fieldWorker_profile_img/" + "_" + params.name + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = fieldWorker.update({
                f_name: params.f_name,
                l_name: params.l_name,
                cnic: params.cnic,
                address: params.address,
                img_url: img_url,
                phone_number: params.phone_number,
                gender: params.gender
            }, { where: { id: req.params.id } });

            fieldWorker.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, record.get({ plain: true }), "success")
            })

        } else {
            return apiRes.apiError(res, "Field Worker is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    fieldWorker.findAll().then((fieldWorkers) => {
        return apiRes.apiSuccess(res, fieldWorkers, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}