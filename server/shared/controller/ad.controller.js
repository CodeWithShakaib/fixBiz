const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const Sequelize = require('sequelize');
const { Op } = require("sequelize")
const catagory = require("../models/category.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const { response } = require("../../config/express")
const shop = require("../models/shop.model")

var today = new Date();
today.setHours(today.getHours() + 5);

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
        transaction_id: params.transaction_id,
        transaction_amount: params.transaction_amount,
        transaction_method: params.transaction_method,
        status: params.status,
        shopId: params.shop_id,
        categoryId: params.category_id
    });
    record.save().then((record) => {
        ad.findByPk(record.id, {
            include: [
                { model: shop }, { model: catagory }
            ]
        }).then((record) => { return apiRes.apiSuccess(res, [record], "Success", ) })

    })
}


function get(req, res) {
    ad.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            ad.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }, {
                    model: catagory
                }]
            }).then(ad => {
                if (ad.end_at > today && ad.status == 'ACTIVE') {
                    ad.isLive = true
                } else {
                    ad.isLive = false
                }
                final_ads.push(ad);

                return apiRes.apiSuccess(res, [ad], "success")
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
                transaction_id: params.transaction_id,
                transaction_amount: params.transaction_amount,
                transaction_method: params.transaction_method,
                status: params.status,
                shopId: params.shop_id,
                categoryId: params.category_id
            }, { where: { id: req.params.id } });

            ad.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }, {
                    model: catagory
                }]
            }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            })

        } else {
            return apiRes.apiError(res, "Ad is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    ad.findAll({
        include: [{
            model: shop
        }, { model: catagory }]
    }).then((record) => {
        final_ads = []
        record.forEach(ad => {
            if (ad.end_at > today && ad.status == 'ACTIVE') {
                ad.isLive = true
            } else {
                ad.isLive = false
            }
            final_ads.push(ad);
        })
        return apiRes.apiSuccess(res, final_ads, "success")
    })
}

function getAdsOnDashboard(req, res) {
    ad.findAll({
        include: [{
            model: shop
        }, { model: catagory }],
        where: {
            status: 'ACTIVE',
            end_at: {
                [Op.gt]: today
            }
        }

    }).then((ads) => {
        live_ads = []

        ads.forEach(ad => {
            ad.isLive = true;
            live_ads.push(ad);
        });

        return apiRes.apiSuccess(res, live_ads, "success")
    })
}

function getAdsByCatagoryId(req, res) {
    ad.findAll({
        where: {
            categoryId: req.body.category_id,
            status: 'ACTIVE',
            end_at: {
                [Op.gt]: today
            }
        },
        include: [{
            model: shop
        }, {
            model: catagory
        }]
    }).then((ads) => {
        live_ads = []

        ads.forEach(ad => {
            ad.isLive = true;
            live_ads.push(ad);
        });
        return apiRes.apiSuccess(res, live_ads, "success")
    })
}

function getAdsByShopId(req, res) {
    ad.findAll({
        where: { shopId: req.body.shop_id },
        include: [{
            model: shop
        }, {
            model: catagory
        }]
    }).then((record) => {
        final_ads = []
        record.forEach(ad => {
            if (ad.end_at > today && ad.status == 'ACTIVE') {
                ad.isLive = true
            } else {
                ad.isLive = false
            }
            final_ads.push(ad);
        })
        return apiRes.apiSuccess(res, final_ads, "success")
    })
}

module.exports = {
    create,
    get,
    del,
    update,
    getAll,
    getAdsByCatagoryId,
    getAdsByShopId,
    getAdsOnDashboard
}