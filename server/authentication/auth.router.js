const express = require('express')
const authCrtl = require('./auth.controller');
const router = express.Router();

router.post('/signIn', authCrtl.signIn);
router.post('/changePassword', authCrtl.changePassword);

module.exports = router