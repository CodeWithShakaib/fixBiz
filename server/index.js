const app = require("./config/express")
const port = process.env.PORT || 3000
const cron = require("node-cron")
const shop = require("./shared/models/shop.model")
const { Op } = require("sequelize")
const ad = require("./shared/models/ad.model")
const subCategory = require("./shared/models/subCategory.model")
const http = require('http').createServer(app); // http server use for whole application





app.get('/', function(req, res) {
    res.send("Welcome to fiz-biz");
});
var a = 0;
// CRON jobs


cron.schedule("59 23 * * *", async function() {
    var someDate = new Date();
    var numberOfDaysToAdd = 31;
    someDate = someDate.setDate(someDate.getDate() - numberOfDaysToAdd);

    var today = new Date();
    today = new Date(today.setHours(today.getHours() + 5));

    await shop.update({ verification_status: 'EXPIRED' }, {
        where: {
            verification_status: 'TRIAL',
            transaction_id: null,
            createdAt: {
                [Op.lt]: new Date(someDate)
            }
        }
    })

    await shop.update({ verification_status: 'PENDING' }, {
        where: {
            verification_status: 'TRIAL',
            transaction_id: !null
        }
    })


    await ad.update({ status: 'EXPIRED', isLive: false }, {
        where: {
            status: 'ACTIVE',
            end_at: {
                [Op.lt]: new Date(today)
            }
        }
    })


});

// cron.schedule('* * * * *', async function() {
//     var someDate = new Date();
//     var numberOfDaysToAdd = 31;
//     someDate = someDate.setDate(someDate.getDate() - numberOfDaysToAdd);

//     var today = new Date();
//     today = new Date(today.setHours(today.getHours() + 5));


//     await shop.update({ verification_status: 'EXPIRED' }, {
//         where: {
//             verification_status: 'TRIAL',
//             createdAt: {
//                 [Op.lt]: someDate
//             }
//         }
//     })

//     await ad.update({ status: 'EXPIRED', isLive: false }, {
//         where: {
//             status: 'ACTIVE',
//             end_at: {
//                 [Op.lt]: today
//             }
//         }
//     })


// });







app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})