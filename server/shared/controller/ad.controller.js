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
const adSubCategory = require("../models/adSubCategory.model");
const adCount = require("../models/adCount.model");
const fs = require('fs')

function view(req, res) {
    let params = req.body;
    adCount.count({
        where: {
            mac_address: params.mac_address,
            adId: params.adId
        }
    }).then((count) => {
            if (count != 0) {
                return apiRes.apiError(res, "Already viewed")
            } else {
                adCount.create({
                    mac_address: params.mac_address,
                    adId: params.adId
                })
                ad.increment('views_count', { by: 1, where: { id: params.adId } }).then((record) => {
                    return apiRes.apiSuccess(res, null, "View added")
                }).catch(err => {
                    return apiRes.apiError(res, err.message)
                });
            }
        }

    ).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function create(req, res) {
    let subCategoryIds = [];
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

    JSON.parse(params.subCategoryIds).forEach(element => {
        subCategoryIds.push({ subCategoryId: element })
    })

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
        adSubCategories: subCategoryIds
    }, {
        include: [adSubCategory]
    });
    record.save().then((record) => {
        ad.findByPk(record.id, {
            include: [
                { model: shop }, { model: catagory }, {
                    model: adSubCategory,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
                    include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                }
            ]
        }).then((record) => {

            record = JSON.parse(JSON.stringify(record))
            record.adSubCategories = record.adSubCategories.map(ele => ele.subCategory)

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
                }, {
                    model: adSubCategory,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
                    include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                }]
            }).then(ad => {
                if (ad.start_at < new Date(today) && ad.end_at > new Date(today) && ad.status == 'ACTIVE') {
                    ad.isLive = true
                } else {
                    ad.isLive = false
                }
                final_ads.push(ad);
                ad = JSON.parse(JSON.stringify(ad))
                ad.adSubCategories = ad.adSubCategories.map(ele => ele.subCategory)

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

async function del(req, res) {
    try {
        let data = await ad.findByPk(req.params.id);
        if (data) {
            if (data.img_url) fs.unlinkSync(process.cwd() + '/server/public/' + data.img_url);
            if (data.video_url) fs.unlinkSync(process.cwd() + '/server/public/' + data.video_url);
        }

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
    } catch {
        return apiRes.apiError(res, "Ad ID is not pressent");
    }



}

function update(req, res) {
    params = req.body
    let subCategories = [];
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

            } else {
                img_url = params.img_url;
            }

            if (req.files && req.files.video) {
                var video = req.files.video
                var video_url = "/ad_video/" + "_" + Date.now() + "_" + video.name;

                video.mv(process.cwd() + '/server/public/' + video_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Video does't uploaded sucessfully.", err)
                });

            } else {
                video_url = params.video_url;
            }

            JSON.parse(params.subCategoryIds).forEach(element => {
                subCategories.push({ adId: req.params.id, subCategoryId: element })
            })

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

            adSubCategory.destroy({
                where: {
                    adId: req.params.id
                }
            })

            adSubCategory.bulkCreate(subCategories)

            ad.findOne({
                where: { id: req.params.id },
                include: [{
                    model: shop
                }, {
                    model: catagory
                }, {
                    model: adSubCategory,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
                    include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                }]
            }).then(record => {
                record = JSON.parse(JSON.stringify(record))
                record.adSubCategories = record.adSubCategories.map(ele => ele.subCategory)
                return apiRes.apiSuccess(res, [record], "success")
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
        }, { model: catagory }, {
            model: adSubCategory,
            attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
            include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
        }]
    }).then((record) => {
        final_ads = []
        record.forEach(ad => {
            if (ad.start_at < new Date(today) && ad.end_at > new Date(today) && ad.status == 'ACTIVE') {
                ad.isLive = true
            } else {
                ad.isLive = false
            }
            ad = JSON.parse(JSON.stringify(ad))
            ad.adSubCategories = ad.adSubCategories.map(ele => ele.subCategory)
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
    let mac_address = req.query.mac_address;

    ad.findAll({
        include: [{
            model: shop
        }, { model: catagory }, {
            model: adSubCategory,
            attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
            include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
        }],
        where: {
            status: 'ACTIVE',
            start_at: {
                [Op.lt]: new Date(today)
            },
            end_at: {
                [Op.gt]: new Date(today)
            }
        }

    }).then(async(ads) => {
        live_ads = []
        let ad_ids = []

        if (mac_address) {
            ad_ids = (await adCount.findAll({ where: { mac_address }, attributes: ['adId'] })).map(ele => ele.adId)
        }





        ads.forEach(ad => {
            ad.isLive = true;
            ad = JSON.parse(JSON.stringify(ad))
            if (ad_ids.includes(ad.id)) {
                ad.isShowed = true
            } else {
                ad.isShowed = false
            }
            ad.adSubCategories = ad.adSubCategories.map(ele => ele.subCategory)
            live_ads.push(ad);
        });





        return apiRes.apiSuccess(res, live_ads, "success")
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

async function getAdsBySubCategoryId(req, res) {
    let mac_address = req.query.mac_address;

    let adIds = await adSubCategory.findAll({
        where: {
            subCategoryId: req.body.subCategoryId
        },
        attributes: ['adId']
    })

    var today = new Date();
    today = today.setHours(today.getHours() + 5);


    ad.findAll({
        where: {
            id: {
                [Op.in]: adIds.map(element => element.adId)
            },
            status: 'ACTIVE',
            start_at: {
                [Op.lt]: new Date(today)
            },
            end_at: {
                [Op.gt]: new Date(today)
            }
        },
        include: [{
            model: shop
        }, {
            model: catagory
        }, {
            model: adSubCategory,
            attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
            include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
        }]
    }).then(async(ads) => {
        live_ads = []
        let ad_ids = []

        if (mac_address) {
            ad_ids = (await adCount.findAll({ where: { mac_address }, attributes: ['adId'] })).map(ele => ele.adId)
        }

        ads.forEach(ad => {
            ad.isLive = true;
            ad = JSON.parse(JSON.stringify(ad))
            if (ad_ids.includes(ad.id)) {
                ad.isShowed = true
            } else {
                ad.isShowed = false
            }
            ad.adSubCategories = ad.adSubCategories.map(ele => ele.subCategory)
            live_ads.push(ad);
        });
        return apiRes.apiSuccess(res, live_ads, "success")
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function getAdsByCategoryId(req, res) {
    var today = new Date();
    today = today.setHours(today.getHours() + 5);

    let mac_address = req.query.mac_address;

    ad.findAll({
        where: {
            categoryId: req.body.categoryId,
            status: 'ACTIVE',
            start_at: {
                [Op.lt]: new Date(today)
            },
            end_at: {
                [Op.gt]: new Date(today)
            }
        },
        include: [{
            model: shop
        }, {
            model: catagory
        }, {
            model: adSubCategory,
            attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
            include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
        }]
    }).then(async(ads) => {
        live_ads = []
        let ad_ids = []

        if (mac_address) {
            ad_ids = (await adCount.findAll({ where: { mac_address }, attributes: ['adId'] })).map(ele => ele.adId)
        }

        ads.forEach(ad => {
            ad.isLive = true;
            ad = JSON.parse(JSON.stringify(ad))
            if (ad_ids.includes(ad.id)) {
                ad.isShowed = true
            } else {
                ad.isShowed = false
            }
            ad.adSubCategories = ad.adSubCategories.map(ele => ele.subCategory)
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
        }, {
            model: adSubCategory,
            attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'adId'] },
            include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
        }]
    }).then((record) => {
        final_ads = []
        record.forEach(ad => {
            if (ad.start_at < new Date(today) && ad.end_at > new Date(today) && ad.status == 'ACTIVE') {
                ad.isLive = true
            } else {
                ad.isLive = false
            }
            ad = JSON.parse(JSON.stringify(ad))
            ad.adSubCategories = ad.adSubCategories.map(ele => ele.subCategory)
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
            }, { where: { id: req.params.id } }).then(async(record1) => {
                fcmCrtl.send_notification("AD_ACTIVE", await shop.findOne({ where: { shopId: record.shopID } }), "Update about your ad", `Your ad ${ele.title} has been active.`);
                return apiRes.apiSuccess(res, "ACTIVE")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        } else {
            ad.update({
                status: 'PENDING'
            }, { where: { id: req.params.id } }).then(async(record2) => {

                fcmCrtl.send_notification("AD_ACTIVE", await shop.findOne({ where: { shopId: record.shopID } }), "Update about your ad", `Your ad ${ele.title} has been pending.`);

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
    getAdsBySubCategoryId,
    getAdsByShopId,
    getAdsOnDashboard,
    adToggle,
    getAdsByCategoryId,
    view
}