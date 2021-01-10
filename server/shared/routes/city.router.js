const express = require('express')
const cityCrtl = require('../controller/city.controller')
const router = express.Router();

router.post('/create', cityCrtl.create);
router.get('/:id/get', cityCrtl.get);
router.delete('/:id/delete', cityCrtl.del);
router.put('/:id/update', cityCrtl.update);
router.get('/get', cityCrtl.getAll);

module.exports = router