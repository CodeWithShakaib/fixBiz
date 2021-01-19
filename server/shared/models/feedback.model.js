const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
const shop = require('./shop.model')
const user = require('./user.model');

let feedback = sequelize.define('feedback', {
    title: datatype.STRING,
    body: datatype.STRING
});

feedback.belongsTo(shop, { foregin_key: { allowNull: true } });
feedback.belongsTo(user, { foregin_key: { allowNull: true } });

feedback.sync().then(() => {
    console.log('New table created');
})


module.exports = feedback