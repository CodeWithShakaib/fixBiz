const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const shop = require('./shop.model');

let gallery = sequelize.define('gallery', {
    title: datatype.STRING,
    img_url: datatype.STRING
});

gallery.belongsTo(shop);


gallery.sync().then(() => {
    console.log('New table created');
})

module.exports = gallery