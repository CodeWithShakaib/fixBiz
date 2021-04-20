const sequelize = require('../../config/db.connection');
const subCategory = require('./subCategory.model');
const ad = require('./ad.model');
const user = require('./user.model');
const datatype = require('sequelize');

let adCount = sequelize.define('adCount', {
    mac_address: datatype.STRING
});

ad.hasMany(adCount);
adCount.sync().then(() => {
    console.log('New table created');
})

module.exports = adCount