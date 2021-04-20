const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const shop = require('./shop.model');
const ad = require('./ad.model');
const { ForeignKeyConstraintError } = require('sequelize');
let notification = sequelize.define('notification', {
    title: datatype.STRING,
    body: datatype.STRING,
});

shop.hasMany(notification);

notification.sync().then(() => {
    console.log("New table created")
})

module.exports = notification