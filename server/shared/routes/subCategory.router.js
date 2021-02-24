const express = require('express')
const subCategoryCrtl = require('../controller/subCategory.controller')
const router = express.Router();

router.post('/create', subCategoryCrtl.create);
router.get('/:id/get', subCategoryCrtl.get);
router.delete('/:id/delete', subCategoryCrtl.del);
router.put('/:id/update', subCategoryCrtl.update);
router.get('/get', subCategoryCrtl.getAll);
router.get('/getByCatagoryId', subCategoryCrtl.getByCatagoryId);


module.exports = router