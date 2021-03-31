const sequelize = require('../../config/db.connection');
const subCategory = require('./subCategory.model');
const shop = require('./shop.model');

let shopSubCategory = sequelize.define('shopSubCategory', {

});

shopSubCategory.belongsTo(subCategory);
// shopSubCategory.belongsTo(shop);
shop.hasMany(shopSubCategory);
shopSubCategory.sync().then(() => {
    console.log('New table created');
})

module.exports = shopSubCategory