const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const { Op } = require("sequelize")
const category = require("../models/category.model")
const subCategory = require("../models/subCategory.model")
const fs = require('fs');

function create(req, res) {

    params = req.body

    value = subCategory.findAll({
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
                var img_url = "/subCategory_icon/" + "_" + params.name.replace(' ', '_') + "_" + image.name.replace(' ', '_');

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Icon does't uploaded sucessfully.", err)
                });

            }

            const record = subCategory.build({
                name: params.name,
                icon: img_url,
                description: params.description,
                categoryId: params.categoryId
            });
            return record.save().then((record) => {
                apiRes.apiSuccess(res, [record], "Success", )
            })
        }
    }).catch((err) => { return apiRes.apiError(res, err.message) }


    )
}

function get(req, res) {
    subCategory.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            subCategory.findOne({ where: { id: req.params.id }, include: [{ model: category }] }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })
        } else {
            return apiRes.apiError(res, "Category is not pressent with this id")
        }

    })

}

async function del(req, res) {
    let data = await subCategory.findByPk(req.params.id);
    if (data) {
        if (data.icon)
            fs.unlinkSync(process.cwd() + '/server/public/' + data.icon);
    }
    subCategory.destroy({
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
    subCategory.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            if (req.files && req.files.icon) {
                var image = req.files.icon
                var img_url = "/subCategory_icon/" + "_" + params.name + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = subCategory.update({
                name: params.name,
                icon: img_url,
                description: params.description,
                categoryId: params.categoryId
            }, { where: { id: req.params.id } });

            subCategory.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })

        } else {
            return apiRes.apiError(res, "Category is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    subCategory.findAll({ include: [{ model: category }] }).then((categories) => {
        return apiRes.apiSuccess(res, categories, "success")
    })
}

function getByCatagoryId(req, res) {
    subCategory.findAll({ where: { categoryId: req.query.id } }).then((categories) => {
        return apiRes.apiSuccess(res, categories, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll,
    getByCatagoryId
}