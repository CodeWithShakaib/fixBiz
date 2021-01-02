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

function create(req, res) {

    params = req.body

    if (req.files && req.files.image) {
        var image = req.files.image
        var img_url = "/ad_img/" + "_" + Date.now() + "_" + image.name;

        image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
            if (err)
                return apiRes.apiError(
                    res, "Image does't uploaded sucessfully.", err)
        });

    }

    if (req.files && req.files.video) {
        var video = req.files.video
        var video_url = "/ad_video/" + "_" + Date.now() + "_" + video.name;

        video.mv(process.cwd() + '/server/public/' + video_url, function(err) {
            if (err)
                return apiRes.apiError(
                    res, "Video does't uploaded sucessfully.", err)
        });

    }

    const record = ad.build({
        title: params.title,
        type: params.type,
        img_url: img_url,
        video_url: video_url,
        views_count: 0,
        duration: params.duration,
        start_at: params.start_at,
        end_at: params.end_at,
        shopID: params.shop_id,
        categoryID: params.category_id
    });
    return record.save().then((record) => {
        apiRes.apiSuccess(res, [record], "Success", )
    })
}


function get(req, res) {
    ad.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            ad.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record], "success")
            })
        } else {
            return apiRes.apiError(res, "ad is not pressent with this id")
        }

    })

}

function del(req, res) {
    ad.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "Ad ID is not pressent");
        }
    });

}

function update(req, res) {
    params = req.body
    ad.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/ad_img/" + "_" + Date.now() + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            if (req.files && req.files.video) {
                var video = req.files.video
                var video_url = "/ad_video/" + "_" + Date.now() + "_" + video.name;

                video.mv(process.cwd() + '/server/public/' + video_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Video does't uploaded sucessfully.", err)
                });

            }

            const record = ad.update({
                title: params.title,
                type: params.type,
                img_url: img_url,
                video_url: video_url,
                views_count: params.views_count,
                duration: params.duration,
                start_at: params.start_at,
                end_at: params.end_at,
                shopID: params.shop_id,
                categoryID: params.category_id
            }, { where: { id: req.params.id } });

            ad.findOne({ where: { id: req.params.id } }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })

        } else {
            return apiRes.apiError(res, "Ad is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    ad.findAll().then((ads) => {
        return apiRes.apiSuccess(res, ads, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll
}