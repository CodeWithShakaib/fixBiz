const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const shop = require('./shop.model');
const category = require('./category.model')

let ad = sequelize.define('ad', {
    title: datatype.STRING,
    type: datatype.STRING,
    img_url: datatype.STRING,
    video_url: datatype.STRING,
    views_count: datatype.INTEGER,
    duration: datatype.INTEGER,
    transaction_id: datatype.STRING,
    transaction_amount: datatype.STRING,
    transaction_method: datatype.STRING,
    status: datatype.STRING,
    start_at: datatype.TIME,
    end_at: datatype.TIME
});

ad.belongsTo(shop);
ad.belongsTo(category);

ad.sync().then(() => {
    console.log('New table created');
})

module.exports = ad