var FCM = require('fcm-node');
const notification = require('../shared/models/notification.model');

const shop = require('../shared/models/shop.model');
var serverKey = 'AAAAISH7kPY:APA91bHCZ7AviSZcDYwC1coqIm2e5A6xqggdE5ji_DS-xtceelhzZUKTUroSfsJ01BRo8smZSYWoo4zjV_JtpggFWeY85xZ_0mMz3c90ByWbEOULX5w75svkWbO12Clzh_KZbhqBK5Mq'; //put your server key here
var fcm = new FCM(serverKey);



function send_notification(collapse_key, shop, title, body) {
    notification.create({
        title,
        body,
        shopId: shop.id
    });
    let fcm_token = shop.fcm_token
    var message = {
        to: fcm_token,
        collapse_key: collapse_key,

        notification: {
            title: title,
            body: body
        },

        data: { //you can send only notification or only data(or include both)
        }
    };

    fcm.send(message, function(err, response) {
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

module.exports = {
    send_notification
}