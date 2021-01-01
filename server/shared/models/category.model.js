const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
let category = sequelize.define('category', {
    name: datatype.STRING,
    icon: datatype.STRING,
    description: datatype.STRING
});

category.sync().then(() => {
    console.log('New table created');
})

module.exports = category