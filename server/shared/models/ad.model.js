const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const shop = require('./shop.model');
const category = require('./category.model')
const subCategory = require('./subCategory.model')
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
    isLive: datatype.BOOLEAN,
    start_at: {
        type: 'TIMESTAMP'
    },
    end_at: {
        type: 'TIMESTAMP'
    }
});

ad.belongsTo(subCategory)
ad.belongsTo(category);



module.exports = ad