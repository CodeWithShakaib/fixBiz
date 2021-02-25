const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const user = require('./user.model')
const category = require('./category.model')
const fieldWorker = require('./fieldWorker.model');
const review = require('./review.model');
const service = require('./service.model');
const gallery = require('./gallery.model');
const city = require('./city.model');
const ad = require('./ad.model');
const subCategory = require('./subCategory.model');


let shop = sequelize.define('shop', {
    name: datatype.STRING,
    address: datatype.STRING,
    img_url: datatype.STRING,
    verification_status: datatype.STRING,
    transaction_id: datatype.STRING,
    transaction_amount: datatype.STRING,
    transaction_method: datatype.STRING,
    longitude: datatype.FLOAT,
    latitude: datatype.FLOAT,
    opening_time: datatype.TIME,
    closing_time: datatype.TIME,
    owner_name: datatype.STRING,
    phone_number: datatype.STRING,
    email: datatype.STRING,
    password: datatype.STRING,
    distance: datatype.FLOAT
});

shop.hasMany(review);
shop.hasMany(service);
shop.hasMany(gallery);
shop.hasMany(ad);
shop.belongsTo(category);
shop.belongsTo(city);
shop.belongsTo(fieldWorker, { foregin_key: { allowNull: true } });
shop.belongsTo(subCategory)

review.belongsTo(shop)
service.belongsTo(shop)
gallery.belongsTo(shop);
ad.belongsTo(shop)

gallery.sync().then(() => {
    console.log('New table created');
})
review.sync().then(() => {
    console.log('New table created');
})

service.sync().then(() => {
    console.log('New table created');
})

ad.sync().then(() => {
    console.log('New table created');
})



shop.sync().then(() => {
    console.log('New table created');
})

module.exports = shop