const express = require('express')
const categoryCrtl = require('../controller/category.controllor')
const router = express.Router();

router.post('/create', categoryCrtl.create);
router.get('/:id/get', categoryCrtl.get);
router.delete('/:id/delete', categoryCrtl.del);
router.put('/:id/update', categoryCrtl.update);
router.get('/get', categoryCrtl.getAll);

module.exports = router