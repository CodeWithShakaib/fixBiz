const express = require('express')
const userCrtl = require('../controller/user.controller')
const shopCrtl = require('../controller/shop.controller')
const router = express.Router();

router.post('/create', shopCrtl.create);
router.get('/:id/get', shopCrtl.get);
router.delete('/:id/delete', shopCrtl.del);
router.put('/:id/update', shopCrtl.update);
router.get('/get', shopCrtl.getAll);
router.put('/getByCategoryId', shopCrtl.getByCatagoryId)

module.exports = router