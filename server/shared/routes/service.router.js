const express = require('express')
const userCrtl = require('../controller/user.controller')
const service = require('../controller/service.controller')
const router = express.Router();

router.post('/create', service.create);
router.get('/:id/get', service.get);
router.delete('/:id/delete', service.del);
router.put('/:id/update', service.update);
router.get('/get', service.getAll);

module.exports = router