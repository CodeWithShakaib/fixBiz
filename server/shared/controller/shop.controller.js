const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const utils = require("../../utils");
const { Op, where } = require("sequelize")
const catagory = require("../models/category.model")
const shop = require("../models/shop.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const user = require("../models/user.model")
const city = require("../models/city.model")
const _ = require('lodash');
const geolib = require('geolib');
const subCategory = require("../models/subCategory.model");
const shopSubCategory = require("../models/shopSubCategory.model");
const fs = require('fs');
const fcmCrtl = require("../../config/fcm.controller");
const { title } = require("process");
const notification = require("../models/notification.model");
const { result } = require("lodash");
const moment = require("moment");

function create(req, res) {
    let subCategoryIds = [];
    params = req.body

    if (params.fieldWorker_id == '0') {
        params.fieldWorker_id = null
    }


    JSON.parse(params.subCategoryIds).forEach(element => {
        subCategoryIds.push({ subCategoryId: element })
    })

    shop.findAll({
        where: {
            [Op.or]: [
                { phone_number: params.phone_number }
            ]
        }
    }).then(record => {
        console.log(record.length)

        if (record.length > 0) {
            apiRes.apiError(
                res, "Email or phone number already exists.")
        } else {
            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/shop_img/" + "_" + Date.now() + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = shop.build({
                name: params.name,
                address: params.address,
                img_url: img_url,
                verification_status: params.verification_status,
                transaction_id: params.transaction_id,
                transaction_amount: params.transaction_amount,
                transaction_method: params.transaction_method,
                longitude: params.longitude,
                latitude: params.latitude,
                opening_time: params.opening_time,
                closing_time: params.closing_time,
                categoryId: params.category_id,
                fieldWorkerId: params.fieldWorker_id,
                owner_name: params.owner_name,
                email: params.email || null,
                password: params.password,
                phone_number: params.phone_number,
                cityId: params.city_id,
                expire_date: new Date(moment().add(1, 'M').format('YYYY-MM-DD')).toISOString().replace('T', ' ').replace('Z', ' ') + '+00:00',
                shopSubCategories: subCategoryIds
            }, {
                include: [shopSubCategory]
            });
            record.save().then((record) => {
                shop.findOne({
                    include: [{ // Notice `include` takes an ARRAY
                        model: catagory
                    }, {
                        model: fieldWorker
                    }, {
                        model: shopSubCategory,
                        attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                        include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                    }],

                    where: {
                        id: record.id
                    }


                }).then((record) => {
                    record = JSON.parse(JSON.stringify(record))
                    record.shopSubCategories = record.shopSubCategories.map(ele => ele.subCategory)
                    return apiRes.apiSuccess(res, [record], "Success", )
                }).catch(err => {
                    return apiRes.apiError(res, err.message)
                });

            }).catch((err) => {
                console.err(err)
                return apiRes.apiError(res, err.message)

            })
        }

    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function searchByWord(req, res) {

    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));


    service.findAll({
        attributes: ['shopId'],
        // exclude: ['shopId'],
        where: {
            name: {
                [Op.like]: '%' + req.body.word + '%'

            }
        }

    }).then((record) => {
        services_ids = []
        record.forEach(element => {
            services_ids.push(element.shopId)
        });

        catagory.findAll({
            attributes: ['id'],
            // exclude: ['shopId'],
            where: {
                name: {
                    [Op.like]: '%' + req.body.word + '%'
                }
            }

        }).then((record) => {
            catagories_ids = []
            record.forEach(element => {
                catagories_ids.push(element.shopId)
            });


            shop.findAll({
                where: {
                    [Op.or]: [{ verification_status: 'ACTIVE' }, { verification_status: 'TRIAL' }],
                    [Op.or]: [{
                        categoryId: {
                            [Op.in]: catagories_ids
                        }
                    }, {
                        name: {
                            [Op.like]: '%' + req.body.word + '%'
                        }
                    }, {
                        id: {
                            [Op.in]: services_ids
                        }
                    }]
                },
                include: [{
                    model: catagory
                }, {
                    model: fieldWorker
                }, {
                    model: review,
                    include: [{ model: user }]
                }, {
                    model: service
                }, {
                    model: city
                }, {
                    model: ad,
                    where: {
                        status: 'ACTIVE',
                        start_at: {
                            [Op.lt]: today
                        },
                        end_at: {
                            [Op.gt]: today
                        }
                    },
                    required: false,

                }, {
                    model: shopSubCategory,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                    include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                }]
            }).then((record1) => {
                if (req.body.longitude == 0.0 && req.body.latitude == 0.0) {
                    let shops = []
                    record1.forEach(element => {
                        element = JSON.parse(JSON.stringify(element))
                        element.shopSubCategories = element.shopSubCategories.map(ele => ele.subCategory)
                        shops.push(element)
                    })
                    return apiRes.apiSuccess(res, shops, "success")
                } else {
                    final_result = []
                    record1.forEach(element => {
                        distance = geolib.getDistance({ latitude: req.body.latitude, longitude: req.body.longitude }, { latitude: element.latitude, longitude: element.longitude }) / 1000
                        if (distance < 20.0) {
                            element = JSON.parse(JSON.stringify(element))
                            element.shopSubCategories = element.shopSubCategories.map(ele => ele.subCategory)
                            element.distance = distance;
                            final_result.push(element);
                        }
                    });

                    return apiRes.apiSuccess(res, final_result, "success")
                }

            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });

        }).catch(err => {
            return apiRes.apiError(res, err.message)
        });
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function get(req, res) {
    shop.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            shop.findOne({
                where: { id: req.params.id },
                include: [{
                    model: catagory
                }, {
                    model: fieldWorker
                }, {
                    model: review,
                    include: [{ model: user }]
                }, {
                    model: service
                }, {
                    model: gallery
                }, {
                    model: city
                }, { model: ad }, {
                    model: shopSubCategory,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                    include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                }]
            }).then(record => {
                record = JSON.parse(JSON.stringify(record))
                record.shopSubCategories = record.shopSubCategories.map(ele => ele.subCategory)
                return apiRes.apiSuccess(res, [record], "success")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        } else {
            return apiRes.apiError(res, "Shop is not pressent with this id")
        }

    })

}

async function del(req, res) {

    // delete shop galleries
    let record = await gallery.findAll({
        where: { shopId: req.params.id }
    })
    if (record) {
        record.forEach(element => {
            fs.unlinkSync(process.cwd() + '/server/public/' + element.img_url);
        });
        await gallery.destroy({ where: { id: record.map(ele => ele.id) } })
    }

    // delete shop
    let data = await shop.findByPk(req.params.id);
    if (data) {
        if (data.img_url)
            fs.unlinkSync(process.cwd() + '/server/public/' + data.img_url);

    }

    shop.destroy({
        where: {
            id: req.params.id
        }
    }).then((rowDeleted) => {

        if (rowDeleted > 0) {
            return apiRes.apiSuccess(res, null, "success");
        } else {
            return apiRes.apiError(res, "Shop ID is not pressent");
        }
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });

}

function update(req, res) {
    let subCategories = []
    params = req.body

    let body;

    JSON.parse(params.subCategoryIds).forEach(element => {
        subCategories.push({ shopId: req.params.id, subCategoryId: element })
    })
    shop.count({ where: { id: req.params.id } }).then(async count => {
        if (count != 0) {
            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/shop_img/" + "_" + Date.now() + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            } else {
                img_url = params.img_url
            }

            console.log(params.expire_date)

            if (params.expire_date) {
                body = {
                    name: params.name,
                    address: params.address,
                    img_url: img_url,
                    verification_status: params.verification_status,
                    transaction_id: params.transaction_id,
                    transaction_amount: params.transaction_amount,
                    transaction_method: params.transaction_method,
                    longitude: params.longitude,
                    latitude: params.latitude,
                    opening_time: params.opening_time,
                    closing_time: params.closing_time,
                    categoryId: params.category_id,
                    fieldWorkerId: params.fieldWorker_id,
                    owner_name: params.owner_name,
                    email: params.email,
                    password: params.password,
                    phone_number: params.phone_number,
                    cityId: params.city_id
                        // expire_date: params.expire_date
                };
            } else {
                body = {
                    name: params.name,
                    address: params.address,
                    img_url: img_url,
                    verification_status: params.verification_status,
                    transaction_id: params.transaction_id,
                    transaction_amount: params.transaction_amount,
                    transaction_method: params.transaction_method,
                    longitude: params.longitude,
                    latitude: params.latitude,
                    opening_time: params.opening_time,
                    closing_time: params.closing_time,
                    categoryId: params.category_id,
                    fieldWorkerId: params.fieldWorker_id,
                    owner_name: params.owner_name,
                    email: params.email,
                    password: params.password,
                    phone_number: params.phone_number,
                    cityId: params.city_id
                };
            }

            const record = shop.update(body, { where: { id: req.params.id } });
            record.then((result) => {
                console.log(result)
            }).catch((err) => {
                return apiRes.apiError(res, err.message)
            })

            await shopSubCategory.destroy({
                where: {
                    shopId: req.params.id
                }
            })

            await shopSubCategory.bulkCreate(subCategories)

            shop.findOne({
                include: [{
                        model: catagory
                    }, {
                        model: fieldWorker
                    }, {
                        model: review,
                        include: [{ model: user }]
                    }, {
                        model: service
                    }, {
                        model: city
                    },
                    { model: ad }, {
                        model: shopSubCategory,
                        attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                        include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                    }
                ],
                where: { id: req.params.id }
            }).then(record => {
                record = JSON.parse(JSON.stringify(record))
                record.shopSubCategories = record.shopSubCategories.map(ele => ele.subCategory)
                return apiRes.apiSuccess(res, [record], "success")
            }).catch(err => {
                console.log(err)
                return apiRes.apiError(res, err.message)
            });

        } else {
            return apiRes.apiError(res, "Shop is not pressent with this id")
        }

    })

}

function getAll(req, res) {

    shop.findAll({
        include: [{
            model: catagory
        }, {
            model: fieldWorker
        }, {
            model: review,
            include: [{ model: user }]
        }, {
            model: service
        }, {
            model: city
        }, {
            model: ad
        }, {
            model: shopSubCategory,
            attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
            include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
        }]
    }).then((shops) => {
        let new_data = []
        shops.forEach(record => {
            record = JSON.parse(JSON.stringify(record))
            record.shopSubCategories = record.shopSubCategories.map(ele => ele.subCategory)
            new_data.push(record)
        })
        return apiRes.apiSuccess(res, new_data, "success")
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}



function getBySubCatagoryId(req, res) {

    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));

    shopSubCategory.findAll({
        where: {
            subCategoryId: req.body.subCategoryId
        },
        attributes: ['shopId']
    }).then(record => {
        shop.findAll({
            where: {
                id: {
                    [Op.in]: record.map(element => element.shopId)
                },
                [Op.or]: [{ verification_status: 'ACTIVE' }, { verification_status: 'TRIAL' }]
            },
            include: [{
                model: catagory
            }, {
                model: fieldWorker
            }, {
                model: review,
                include: [{ model: user }]
            }, {
                model: service
            }, {
                model: city
            }, {
                model: ad,
                where: {
                    status: 'ACTIVE',
                    start_at: {
                        [Op.lt]: new Date(today)
                    },
                    end_at: {
                        [Op.gt]: new Date(today)
                    }
                },
                required: false,

            }, {
                model: shopSubCategory,
                attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
            }]
        }).then((record) => {
            if (req.body.longitude == 0.0 && req.body.latitude == 0.0) {
                let shops = []
                record.forEach(element => {
                    element = JSON.parse(JSON.stringify(element))
                    element.shopSubCategories = element.shopSubCategories.map(ele => ele.subCategory)
                    shops.push(element)
                })

                return apiRes.apiSuccess(res, shops, "success")
            } else {
                final_result = []

                for (let i = 0; i < record.length; i++) {
                    ads = []
                    distance = geolib.getDistance({ latitude: req.body.latitude, longitude: req.body.longitude }, { latitude: record[i].latitude, longitude: record[i].longitude }) / 1000
                    if (distance < 20.0) {
                        record[i] = JSON.parse(JSON.stringify(record[i]))
                        record[i].shopSubCategories = record[i].shopSubCategories.map(ele => ele.subCategory)
                        record[i].distance = distance;
                        final_result.push(record[i]);
                    }

                }
                return apiRes.apiSuccess(res, final_result, "success")
            }



        }).catch(err => {
            return apiRes.apiError(res, err.message)
        });
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });



}

async function searchFilter(req, res) {
    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));

    if (!req.body.subCategoryId) req.body.subCategoryId = 0
    if (!req.body.city_id) req.body.city_id = 0
    if (!req.body.longitude) req.body.longitude = 0.0
    if (!req.body.latitude) req.body.latitude = 0.0

    let shopIds = await shopSubCategory.findAll({
        where: {
            subCategoryId: req.body.subCategoryId
        },
        attributes: ['shopId']
    })



    service.findAll({
        attributes: ['shopId'],
        // exclude: ['shopId'],
        where: {
            name: {
                [Op.like]: `%${req.body.service}%`
            }
        }

    }).then((record) => {
        ids = []
        record.forEach(element => {
            ids.push(element.shopId)
        });


        shop.findAll({
            where: {
                [Op.or]: [{ verification_status: 'ACTIVE' }, { verification_status: 'TRIAL' }],
                id: {
                    [Op.in]: ids.concat(shopIds.map(element => element.shopId))
                }

            },
            include: [{
                model: catagory
            }, {
                model: fieldWorker
            }, {
                model: review,
                include: [{ model: user }]
            }, {
                model: service
            }, {
                model: city
            }, {
                model: ad,
                where: {
                    status: 'ACTIVE',
                    start_at: {
                        [Op.lt]: new Date(today)
                    },
                    end_at: {
                        [Op.gt]: new Date(today)
                    }
                },
                required: false,

            }, {
                model: shopSubCategory,
                attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
            }]
        }).then((record1) => {

            if (req.body.longitude == 0.0 && req.body.latitude == 0.0) {
                shop.findAll({
                    where: { cityId: req.body.city_id },
                    include: [{
                        model: catagory
                    }, {
                        model: fieldWorker
                    }, {
                        model: review,
                        include: [{ model: user }]
                    }, {
                        model: service
                    }, {
                        model: city
                    }, {
                        model: ad,
                        where: {
                            status: 'ACTIVE',
                            start_at: {
                                [Op.lt]: new Date(today)
                            },
                            end_at: {
                                [Op.gt]: new Date(today)
                            }
                        },
                        required: false,

                    }, {
                        model: shopSubCategory,
                        attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                        include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                    }],
                    [Op.or]: [{ verification_status: 'ACTIVE' }, { verification_status: 'TRIAL' }]
                }).then((record) => {
                    let shops = []
                    utils.getUnique(record1.concat(record)).forEach(record => {
                        record = JSON.parse(JSON.stringify(record))
                        record.shopSubCategories = record.shopSubCategories.map(ele => ele.subCategory)
                        shops.push(record)
                    })
                    return apiRes.apiSuccess(res, shops, "success")
                }).catch(err => {
                    return apiRes.apiError(res, err.message)
                });


            } else {
                final_result = []
                record1.forEach(element => {
                    distance = geolib.getDistance({ latitude: req.body.latitude, longitude: req.body.longitude }, { latitude: element.latitude, longitude: element.longitude }) / 1000
                    if (distance < 20.0) {
                        element.distance = distance;
                        final_result.push(element);
                    }
                });
                shop.findAll({
                    where: { cityId: req.body.city_id },
                    include: [{
                        model: catagory
                    }, {
                        model: fieldWorker
                    }, {
                        model: review,
                        include: [{ model: user }]
                    }, {
                        model: service
                    }, {
                        model: city
                    }, {
                        model: ad,
                        where: {
                            status: 'ACTIVE',
                            start_at: {
                                [Op.lt]: new Date(today)
                            },
                            end_at: {
                                [Op.gt]: new Date(today)
                            }
                        },
                        required: false,

                    }, {
                        model: shopSubCategory,
                        attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                        include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                    }],
                    [Op.or]: [{ verification_status: 'ACTIVE' }, { verification_status: 'TRIAL' }]
                }).then((record) => {
                    record.forEach(element => {
                        distance = geolib.getDistance({ latitude: req.body.latitude, longitude: req.body.longitude }, { latitude: element.latitude, longitude: element.longitude }) / 1000
                        element.distance = distance;
                        element = JSON.parse(JSON.stringify(element))
                        element.shopSubCategories = element.shopSubCategories.map(ele => ele.subCategory)
                        final_result.push(element);
                    })
                    return apiRes.apiSuccess(res, utils.getUnique(final_result), "success")
                }).catch(err => {
                    return apiRes.apiError(res, err.message)
                });
            }

        }).catch(err => {
            return apiRes.apiError(res, err.message)
        });
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });
}

function activateShop(req, res) {
    shop.findOne({ where: { id: req.params.id } }).then((record) => {
        if (record.verification_status == 'PENDING') {
            shop.update({
                verification_status: 'ACTIVE',
                expire_date: new Date(moment().add(1, 'Y').format('YYYY-MM-DD')).toISOString().replace('T', ' ').replace('Z', ' ') + '+00:00',

            }, { where: { id: req.params.id } }).then(async(record) => {

                fcmCrtl.send_notification("SHOP_ACTIVE", await shop.findByPk(req.params.id), "Update about your shop", "Your shop status has been active. Check profile for more information.");
                return apiRes.apiSuccess(res, null, "ACTIVE")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        } else {
            shop.update({
                verification_status: 'PENDING'
            }, { where: { id: req.params.id } }).then(async(record) => {
                fcmCrtl.send_notification("SHOP_PENDIND", await shop.findByPk(req.params.id), "Update about your shop", "Your shop status has been pending. Check profile for more information.");
                return apiRes.apiSuccess(res, null, "PENDING", )
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        }

    }).catch(() => {
        return apiRes.apiSuccess(res, "Id is not pressent")
    })

}

function updateFCM(req, res) {
    let id = req.params.id;
    let fcm_token = req.body.fcm_token;
    shop.update({ fcm_token }, { where: { id } }).then((response) => {
        return apiRes.apiSuccess(res, [], "Fcm token updated sucessfully")
    }).catch((err) => {
        return apiRes.apiError(res, err.message)
    })
}

function getByCityId(req, res) {

    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));



    shop.findAll({
        where: { cityId: req.body.city_id, [Op.or]: [{ verification_status: 'ACTIVE' }, { verification_status: 'TRIAL' }] },
        include: [{
            model: catagory
        }, {
            model: fieldWorker
        }, {
            model: review,
            include: [{ model: user }]
        }, {
            model: service
        }, {
            model: city
        }, {
            model: ad,
            where: {
                status: 'ACTIVE',
                start_at: {
                    [Op.lt]: new Date(today)
                },
                end_at: {
                    [Op.gt]: new Date(today)
                }
            },
            required: false,

        }, {
            model: shopSubCategory,
            attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
            include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
        }]
    }).then((record) => {
        // if (req.body.longitude == 0.0 && req.body.latitude == 0.0) {

        //     return apiRes.apiSuccess(res, record, "success")
        // } else {
        //     final_result = []

        //     for (let i = 0; i < record.length; i++) {
        //         ads = []
        //         distance = geolib.getDistance({ latitude: req.body.latitude, longitude: req.body.longitude }, { latitude: record[i].latitude, longitude: record[i].longitude }) / 1000
        //         record[i].distance = distance;
        //         final_result.push(record[i]);

        //     }
        let shops = []
        record.forEach(element => {
            element = JSON.parse(JSON.stringify(element))
            element.shopSubCategories = element.shopSubCategories.map(ele => ele.subCategory)
            shops.push(element)
        })

        return apiRes.apiSuccess(res, shops, "success")

    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });

}

function notifyShops(req, res) {
    let shops_ids;
    if (Array.isArray(req.body.shops_ids)) {
        shops_ids = req.body.shops_ids
    } else {
        shops_ids = JSON.parse(req.body.shops_ids)
    }
    shop.findAll({
        where: {
            id: {
                [Op.in]: shops_ids
            }
        },
        attributes: ['id', 'fcm_token']
    }).then((shops) => {
        shops.forEach((shop) => {
            fcmCrtl.send_notification('FROM_ADMIN', shop, req.body.title, req.body.body);
        })

        return apiRes.apiSuccess(res, "Notifications sent sucessfully");
    }).catch(err => {
        return apiRes.apiError(res, err.message)
    })
}

function notifications(req, res) {
    let limit = req.query.limit;
    let offset = req.query.offset;

    if (!limit) limit = 10
    if (!offset) offset = 0

    notification.findAll({
        where: { shopId: req.params.id },
        attributes: { exclude: ['updatedAt'] },
        offset: offset * limit,
        limit,
        order: [
            ['id', 'DESC']
        ]
    }).then((result) => {
        return apiRes.apiSuccess(res, result)
    }).catch((err) => {
        return apiRes.apiError(res, result)
    })
}

async function test(req, res) {

    return apiRes.apiSuccess(res)

}

module.exports = {
    create,
    get,
    del,
    update,
    getAll,
    getBySubCatagoryId,
    searchFilter,
    searchByWord,
    activateShop,
    getByCityId,
    updateFCM,
    notifyShops,
    notifications,
    test
}