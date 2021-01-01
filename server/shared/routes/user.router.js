const express = require('express')
const userCrtl = require('../controller/user.controller')
const router = express.Router();

router.post('/create', userCrtl.create);
router.get('/:id/get', userCrtl.get);
router.delete('/:id/delete', userCrtl.del);
router.put('/:id/update', userCrtl.update);
router.get('/get', userCrtl.getAll);

module.exports = router