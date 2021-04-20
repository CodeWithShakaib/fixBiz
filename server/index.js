const app = require("./config/express")
const port = process.env.PORT || 3000
const cron = require("node-cron")
const shop = require("./shared/models/shop.model")
const { Op } = require("sequelize")
const ad = require("./shared/models/ad.model")
const subCategory = require("./shared/models/subCategory.model")
const shopSubCategory = require("./shared/models/shopSubCategory.model")
const adSubCategory = require("./shared/models/adSubCategory.model")
const notification = require('./shared/models/notification.model');
const http = require('http').createServer(app); // http server use for whole application

const fcmCrtl = require("../server/config/fcm.controller");



app.get('/', function(req, res) {
    res.send("Welcome to fiz-biz");
});
var a = 0;
// CRON jobs


cron.schedule("59 23 * * *", async function() {
    // /**
    //  * logic to expire shop trial and send notification.
    //  */

    let trial_shops = await shop.findAll({
        where: {
            verification_status: 'TRIAL',
            transaction_id: {
                [Op.or]: [null, '']
            },
            expire_date: {
                [Op.lt]: new Date()
            }
        }
    });


    let trial_shops_ids = trial_shops.map(ele => ele.id)
    await shop.update({ verification_status: 'EXPIRED' }, {
        where: {
            id: {
                [Op.in]: trial_shops_ids
            }
        }
    })
    trial_shops.forEach(ele => {
        console.log("Trial period of your shop has been expired. Check profile for more information.");
        fcmCrtl.send_notification("TRIAL_SHOP_EXPIRED", ele, "Update about your shop", "Trial period of your shop has been expired. Check profile for more information.");
    });


    /**
     * logic to send notification when five days are left to expire trial.
     */

    let someDate = new Date();

    let five_days_before = someDate.setDate(someDate.getDate() - 25);


    let expiring_shops_in_five_days = await shop.findAll({
        where: {
            verification_status: 'TRIAL',
            transaction_id: {
                [Op.or]: [null, '']
            },
            createdAt: {
                [Op.lt]: new Date(five_days_before)
            }
        }
    });

    let count;
    expiring_shops_in_five_days.forEach(async(ele) => {
        count = await notification.count({ where: { body: 'Trial period of your shop is going to end after five days.', shopId: ele.id } })
        if (count == 0) {
            console.log("Trial period of your shop is going to end after five days.");
            fcmCrtl.send_notification("TRIAL_SHOP_EXPIRING", ele, "Update about your shop", "Trial period of your shop is going to end after five days.");
        }
    });

    /**
     * logic to make shop status pending when transition id is not null.
     */

    pending_shops = await shop.findAll({
        where: {
            verification_status: 'TRIAL',
            transaction_id: {
                [Op.not]: ['']
            }
        }
    });

    pending_shops.forEach(ele => {
        console.log("Your shop status has been pending. Check profile for more information.");
        fcmCrtl.send_notification("SHOP_PENDIND", ele, "Update about your shop", "Your shop status has been pending. Check profile for more information.");
    });

    pending_shops_ids = pending_shops.map(ele => ele.id)
    console.log(pending_shops_ids)

    await shop.update({ verification_status: 'PENDING' }, {
        where: {
            id: {
                [Op.in]: pending_shops_ids
            }
        }
    })

    /**
     * logic to make ads expired when end_at is greater then current time.
     */

    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));

    let expired_ads = await ad.findAll({
        where: {
            status: 'ACTIVE',
            end_at: {
                [Op.lt]: new Date(today)
            }
        }
    });

    expired_ads.forEach(async(ele) => {
        console.log("Your shop status has been pending. Check profile for more information.");
        fcmCrtl.send_notification("EXPIRED_ADS", await shop.findOne({ where: { shopId: ele.shopID } }), "Update about your ad", `Your ad ${ele.title} has been expired. Your ad has been seen by ${ele.views_count} people.`);
    });

    expired_ads_ids = expired_ads.map(ele => ele.id)


    await ad.update({ status: 'EXPIRED', isLive: false }, {
        where: {
            id: {
                [Op.in]: expired_ads_ids
            }
        }
    })

    /**
     * logic to send notification when five days are left to expire.
     */

    let someDate1 = new Date();

    let five_days_before_expired = someDate1.setDate(someDate1.getDate() - 360);


    let expiring_active_shops_in_five_days = await shop.findAll({
        where: {
            verification_status: 'ACTIVE',
            expire_date: {
                [Op.lt]: new Date(five_days_before_expired)
            }
        }
    });

    let count1;
    expiring_active_shops_in_five_days.forEach(async(ele) => {
        count = await notification.count({ where: { body: 'Your shop is going to expire in five days.', shopId: ele.id } })
        if (count1 == 0) {
            console.log("Your shop is going to expire in five days.");
            fcmCrtl.send_notification("SHOP_EXPIRING", ele, "Update about your shop", "Your shop is going to expire in five days.");
        }
    });

    /**
     * logic to expire shop and send notification.
     */

    var today1 = new Date();
    today1 = new Date(today1.setHours(today1.getHours() + 5));

    let expired_shops = await shop.findAll({
        where: {
            verification_status: 'ACTIVE',

            expire_date: {
                [Op.lt]: new Date()
            }
        }
    });


    let expired_shops_ids = expired_shops.map(ele => ele.id)
    await shop.update({ verification_status: 'EXPIRED' }, {
        where: {
            id: {
                [Op.in]: expired_shops_ids
            }
        }
    })
    expired_shops.forEach(ele => {
        console.log("Your shop status has been expired. Check profile for more information.");
        fcmCrtl.send_notification("SHOP_EXPIRED", ele, "Update about your shop", "Your shop status has been expired. Check profile for more information.");
    });


});


app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})