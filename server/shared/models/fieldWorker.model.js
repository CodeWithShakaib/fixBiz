const sequelize = require('../../config/db.connection');
const datatype = require('sequelize');

let fieldWorker = sequelize.define('fieldWorker', {
    f_name: datatype.STRING,
    l_name: datatype.STRING,
    cnic: datatype.STRING,
    address: datatype.STRING,
    img_url: datatype.STRING,
    phone_number: datatype.STRING,
    gender: datatype.STRING
});



fieldWorker.sync().then(() => {
    console.log('New table created');
})

module.exports = fieldWorker