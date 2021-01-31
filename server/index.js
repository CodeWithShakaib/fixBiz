const app = require("./config/express")
const port = process.env.PORT || 3000
const cron = require("node-cron")
const shop = require("./shared/models/shop.model")
const { Op } = require("sequelize")
const http = require('http').createServer(app); // http server use for whole application





app.get('/', function(req, res) {
    res.send("Welcome to fiz-biz");
});
var a = 0;
// CRON jobs


cron.schedule("59 23 * * *", function() {
    var someDate = new Date();
    var numberOfDaysToAdd = 31;
    someDate = someDate.setDate(someDate.getDate() - numberOfDaysToAdd);

    shop.update({ verification_status: 'EXPIRED' }, {
        where: {
            verification_status: 'TRIAL',
            createdAt: {
                [Op.lt]: someDate
            }
        }
    })
});

cron.schedule("1 * * * * *", () => {
    console.log("hello");
})



cron.schedule("59 13 * * *", function() {
    var someDate = new Date();
    var numberOfDaysToAdd = 31;
    someDate = someDate.setDate(someDate.getDate() - numberOfDaysToAdd);

    ad.update({ status: 'EXPIRED' }, {
        where: {
            verification_status: 'TRIAL',
            createdAt: {
                [Op.lt]: someDate
            }
        }
    })
});



app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})