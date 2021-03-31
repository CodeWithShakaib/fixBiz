const sequelize = require('../../config/db.connection');
const subCategory = require('./subCategory.model');
const ad = require('./ad.model');

let adSubCategory = sequelize.define('adSubCategory', {

});

adSubCategory.belongsTo(subCategory);
ad.hasMany(adSubCategory);
adSubCategory.sync().then(() => {
    console.log('New table created');
})

module.exports = adSubCategory