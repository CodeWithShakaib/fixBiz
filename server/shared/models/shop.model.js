const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const user = require('./user.model')
const category = require('./category.model')
const fieldWorker = require('./fieldWorker.model')

let shop = sequelize.define('shop', {
    name: datatype.STRING,
    address: datatype.STRING,
    img_url: datatype.STRING,
    verification_status: datatype.BOOLEAN,
    transaction_id: datatype.STRING,
    transaction_amount: datatype.STRING,
    transaction_method: datatype.STRING,
    longitude: datatype.FLOAT,
    latitude: datatype.FLOAT,
    opening_time: datatype.TIME,
    closing_time: datatype.TIME
});

shop.belongsTo(user);
shop.belongsTo(category);
shop.belongsTo(fieldWorker);

shop.sync().then(() => {
    console.log('New table created');
})

module.exports = shop