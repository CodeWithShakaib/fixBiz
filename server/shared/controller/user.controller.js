const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const user = require("../models/user.model")
const catagory = require("../models/category.model")
const shop = require("../models/shop.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const city = require("../models/city.model")
const { response } = require("../../config/express")

function create(req, res) {

    params = req.body

    value = user.findAll({
        where: {
            [Op.or]: [
                { email: params.email },
                { phone_number: params.phone_number }
            ]
        }
    }).then(record => {
        console.log(record.length)
        if (record.length > 0) {
            apiRes.apiError(
                res, "Email or phone number already exists.", null)
        } else {

            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/user_profile_img/" + "_" + params.email + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = user.build({
                f_name: params.f_name,
                l_name: params.l_name,
                email: params.email,
                password: params.password,
                img_url: img_url,
                type: params.type,
                phone_number: params.phone_number
            });
            return record.save().then((record) => {
                apiRes.apiSuccess(res, [record], "Success", )
            })
        }
    }).catch(error => console.log(error))

}

function get(req, res) {
    user.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            user.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })
        } else {
            return apiRes.apiError(res, "User is not pressent with this id")
        }

    })

}

function del(req, res) {
    user.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "User ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    user.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/user_profile_img/" + "_" + params.email + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = user.update({
                f_name: params.f_name,
                l_name: params.l_name,
                email: params.email,
                password: params.password,
                img_url: img_url,
                type: params.type,
                phone_number: params.phone_number
            }, { where: { id: req.params.id } });

            user.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })

        } else {
            return apiRes.apiError(res, "User is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    user.findAll().then((users) => {
        return apiRes.apiSuccess(res, users, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}