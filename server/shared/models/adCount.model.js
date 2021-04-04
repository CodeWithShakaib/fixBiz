const sequelize = require('../../config/db.connection');
const subCategory = require('./subCategory.model');
const ad = require('./ad.model');
const user = require('./user.model');

let adCount = sequelize.define('adCount', {

});

user.hasMany(adCount);
ad.hasMany(adCount);
adCount.sync().then(() => {
    console.log('New table created');
})

module.exports = adCount