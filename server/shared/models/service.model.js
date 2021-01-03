const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const shop = require('../models/shop.model')
let service = sequelize.define('service', {
    name: datatype.STRING,
    description: datatype.STRING,
    img_url: datatype.STRING,
    orignal_price: datatype.FLOAT,
    discount: datatype.FLOAT
});

// service.belongsTo(shop);


// service.sync().then(() => {
//     console.log('New table created');
// })

module.exports = service