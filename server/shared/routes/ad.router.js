const express = require('express')
const adCrtl = require('../controller/ad.controller')
const router = express.Router();

router.post('/create', adCrtl.create);
router.get('/:id/get', adCrtl.get);
router.delete('/:id/delete', adCrtl.del);
router.put('/:id/update', adCrtl.update);
router.get('/get', adCrtl.getAll);

module.exports = router