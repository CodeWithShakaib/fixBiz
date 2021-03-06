const express = require('express')
const adCrtl = require('../controller/ad.controller')
const router = express.Router();

router.post('/create', adCrtl.create);
router.get('/:id/get', adCrtl.get);
router.delete('/:id/delete', adCrtl.del);
router.put('/:id/update', adCrtl.update);
router.get('/get', adCrtl.getAll);
router.post('/getAdsByCategoryId', adCrtl.getAdsByCategoryId);
router.post('/getAdsBySubCategoryId', adCrtl.getAdsBySubCategoryId);
router.post('/getAdsByShopId', adCrtl.getAdsByShopId);
router.get('/getAdsOnDashboard', adCrtl.getAdsOnDashboard);
router.put('/:id/adToggle', adCrtl.adToggle)
router.post('/view', adCrtl.view);

module.exports = router