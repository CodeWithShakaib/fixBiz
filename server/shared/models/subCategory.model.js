const sequelize = require('../../config/db.connection');
const category = require('../models/category.model');
const datatype = require('sequelize');
let subCategory = sequelize.define('subCategory', {
    name: datatype.STRING,
    icon: datatype.STRING,
    description: datatype.STRING
});

subCategory.belongsTo(category);
subCategory.sync().then(() => {
    console.log('New table created');
})

module.exports = subCategory