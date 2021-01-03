const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const shop = require('./shop.model')
const user = require('./user.model');

let review = sequelize.define('review', {
    body: datatype.STRING,
    rating: datatype.STRING
});

// review.belongsTo(shop);
review.belongsTo(user);



module.exports = review