const express = require('express')
const shopCrtl = require('../controller/shop.controller')
const router = express.Router();

router.post('/create', shopCrtl.create);
router.get('/:id/get', shopCrtl.get);
router.delete('/:id/delete', shopCrtl.del);
router.put('/:id/update', shopCrtl.update);
router.get('/get', shopCrtl.getAll);
router.put('/getBySubCategoryId', shopCrtl.getBySubCatagoryId)
router.put('/getByCityId', shopCrtl.getByCityId)
router.post('/searchFilter', shopCrtl.searchFilter)
router.post('/searchByWord', shopCrtl.searchByWord)
router.put('/:id/activateShop', shopCrtl.activateShop)




module.exports = router