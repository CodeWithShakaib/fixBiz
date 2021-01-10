const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
let city = sequelize.define('city', {
    name: datatype.STRING,
    description: datatype.STRING
});

city.sync().then(() => {
    console.log('New table created');
})

module.exports = city