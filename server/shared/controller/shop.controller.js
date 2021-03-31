const apiRes = require("../../config/api.response")
const sequelize = require("../../config/db.connection")
const utils = require("../../utils");
const { Op } = require("sequelize")
const catagory = require("../models/category.model")
const shop = require("../models/shop.model")
const ad = require("../models/ad.model")
const review = require("../models/review.model")
const service = require("../models/service.model")
const gallery = require("../models/gallery.model")
const fieldWorker = require("../models/fieldWorker.model")
const { response } = require("../../config/express")
const user = require("../models/user.model")
const city = require("../models/city.model")
const _ = require('lodash');
const { isDate } = require("lodash")
const geolib = require('geolib');
const subCategory = require("../models/subCategory.model");
const shopSubCategory = require("../models/shopSubCategory.model");





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
                res, "Email or phone number already exists.", null)
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


                }).then((record) => { return apiRes.apiSuccess(res, [record], "Success", ) }).catch(err => {
                    return apiRes.apiError(res, err.message)
                });

            }).catch((err) => {
                return apiRes.apiError(res, null, err)

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
                    return apiRes.apiSuccess(res, record1, "success")
                } else {
                    final_result = []
                    record1.forEach(element => {
                        distance = geolib.getDistance({ latitude: req.body.latitude, longitude: req.body.longitude }, { latitude: element.latitude, longitude: element.longitude }) / 1000
                        if (distance < 20.0) {
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
                return apiRes.apiSuccess(res, [record], "success")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        } else {
            return apiRes.apiError(res, "Shop is not pressent with this id")
        }

    })

}

function del(req, res) {
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
    });;

}

function update(req, res) {
    let subCategoryIds = []
    params = req.body
    JSON.parse(params.subCategoryIds).forEach(element => {
        subCategoryIds.push({ subCategoryId: element })
    })
    shop.count({ where: { id: req.params.id } }).then(count => {
        if (count != 0) {
            if (req.files && req.files.image) {
                var image = req.files.image
                var img_url = "/shop_img/" + "_" + Date.now() + "_" + image.name;

                image.mv(process.cwd() + '/server/public/' + img_url, function(err) {
                    if (err)
                        return apiRes.apiError(
                            res, "Image does't uploaded sucessfully.", err)
                });

            }

            const record = shop.update({
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
                cityId: params.city_id,
                shopSubCategories: subCategoryIds
            }, { where: { id: req.params.id } }, {
                include: [shopSubCategory]
            });

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
                    model: city
                }, { model: ad }, {
                    model: shopSubCategory,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'shopId'] },
                    include: [{ model: subCategory, attributes: { exclude: ['createdAt', 'updatedAt', 'categoryId'] } }],
                }]
            }).then(record => {
                return apiRes.apiSuccess(res, [record.get({ plain: true })], "success")
            }).catch(err => {
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
        return apiRes.apiSuccess(res, shops, "success")
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

                return apiRes.apiSuccess(res, record, "success")
            } else {
                final_result = []

                for (let i = 0; i < record.length; i++) {
                    ads = []
                    distance = geolib.getDistance({ latitude: req.body.latitude, longitude: req.body.longitude }, { latitude: record[i].latitude, longitude: record[i].longitude }) / 1000
                    if (distance < 20.0) {
                        record[i].distance = distance;
                        final_result.push(record[i]);
                    }

                }
                return apiRes.apiSuccess(res, final_result, "success")
            }



        }).catch(err => {
            return apiRes.apiError(res, err)
        });
    }).catch(err => {
        return apiRes.apiError(res, null, err)
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
                    return apiRes.apiSuccess(res, utils.getUnique(record1.concat(record)), "success")
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
                verification_status: 'ACTIVE'
            }, { where: { id: req.params.id } }).then((record) => {
                return apiRes.apiSuccess(res, "ACTIVE")
            }).catch(err => {
                return apiRes.apiError(res, err.message)
            });
        } else {
            shop.update({
                verification_status: 'PENDING'
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


        return apiRes.apiSuccess(res, record, "success")
            // }



    }).catch(err => {
        return apiRes.apiError(res, err.message)
    });

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
    getByCityId
}