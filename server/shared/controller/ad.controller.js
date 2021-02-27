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
const shop = require("../models/shop.model");
const subCategory = require("../models/subCategory.model");


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
        categoryId: params.category_id,
        subCategoryId: params.subCategoryId
    });
    record.save().then((record) => {
        ad.findByPk(record.id, {
            include: [
                { model: shop }, { model: catagory }, { model: subCategory }
            ]
        }).then((record) => {
            console.log(typeof record.end_at)
            return apiRes.apiSuccess(res, [record], "Success", )
        }).catch(err => {
            return apiRes.apiError(res, err.message)
        });

    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}


function get(req, res) {
    let final_ads = []
    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));

    ad.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            ad.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }, {
                    model: catagory
                }, { model: subCategory }]
            }).then(ad => {
                if (ad.start_at < today && ad.end_at > today && ad.status == 'ACTIVE') {
                    ad.isLive = true
                } else {
                    ad.isLive = false
                }
                final_ads.push(ad);

                return apiRes.apiSuccess(res, [ad], "success")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        } else {
            return apiRes.apiError(res, "ad is not pressent with this id")
        }

    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });

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
    }).catch(err => {
        return apiRes.apiError(res, err.message)
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
                categoryId: params.category_id,
                subCategoryId: params.subCategoryId
            }, { where: { id: req.params.id } });

            ad.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }, {
                    model: catagory
                }, { model: subCategory }]
            }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });

        } else {
            return apiRes.apiError(res, "Ad is not pressent with this id")
        }

    })

}

function getAll(req, res) {
    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));


    ad.findAll({
        include: [{
            model: shop
        }, { model: catagory }, { model: subCategory }]
    }).then((record) => {
        final_ads = []
        record.forEach(ad => {
            if (ad.start_at < today && ad.end_at > today && ad.status == 'ACTIVE') {
                ad.isLive = true
            } else {
                ad.isLive = false
            }
            final_ads.push(ad);
        })
        return apiRes.apiSuccess(res, final_ads, "success")
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function getAdsOnDashboard(req, res) {

    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));


    ad.findAll({
        include: [{
            model: shop
        }, { model: catagory }, { model: subCategory }],
        where: {
            status: 'ACTIVE',
            start_at: {
                [Op.lt]: today
            },
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
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function getAdsBySubCatagoryId(req, res) {

    var today = new Date();
    today = today.setHours(today.getHours() + 6);


    ad.findAll({
        where: {
            subCategoryId: req.body.subCategoryId,
            status: 'ACTIVE',
            start_at: {
                [Op.lt]: today
            },
            end_at: {
                [Op.gt]: today
            }
        },
        include: [{
            model: shop
        }, {
            model: catagory
        }, { model: subCategory }]
    }).then((ads) => {
        live_ads = []

        ads.forEach(ad => {
            ad.isLive = true;
            live_ads.push(ad);
        });
        return apiRes.apiSuccess(res, live_ads, "success")
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function getAdsByShopId(req, res) {

    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));

    ad.findAll({
        where: { shopId: req.body.shop_id },
        include: [{
            model: shop
        }, {
            model: catagory
        }, { model: subCategory }]
    }).then((record) => {
        final_ads = []
        record.forEach(ad => {
            if (ad.start_at < today && ad.end_at > today && ad.status == 'ACTIVE') {
                ad.isLive = true
            } else {
                ad.isLive = false
            }
            final_ads.push(ad);
        })
        return apiRes.apiSuccess(res, final_ads, "success")
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}


function adToggle(req, res) {
    ad.findOne({ where: { id: req.params.id } }).then((record) => {
        if (record.status == 'PENDING') {
            ad.update({
                status: 'ACTIVE'
            }, { where: { id: req.params.id } }).then((record) => {
                return apiRes.apiSuccess(res, "ACTIVE")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        } else {
            ad.update({
                status: 'PENDING'
            }, { where: { id: req.params.id } }).then((record) => {
                return apiRes.apiSuccess(res, "PENDING")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        }

    }).catch(() => {
        return apiRes.apiSuccess(res, "Id is not pressent")
    })

}

module.exports = {
    create,
    get,
    del,
    update,
    getAll,
    getAdsBySubCatagoryId,
    getAdsByShopId,
    getAdsOnDashboard,
    adToggle
}