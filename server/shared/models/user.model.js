const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');
let user = sequelize.define('user', {
    f_name: datatype.STRING,
    l_name: datatype.STRING,
    email: datatype.STRING,
    password: datatype.STRING,
    phone_number: datatype.STRING,
    img_url: datatype.STRING,
    type: datatype.STRING
});

user.sync().then(() => {
    console.log('New table created');
})

module.exports = user