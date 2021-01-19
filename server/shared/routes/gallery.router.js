const express = require('express')
const userCrtl = require('../controller/user.controller')
const gallery = require('../controller/gallery.controller')

const router = express.Router();

router.post('/create', gallery.create);
router.get('/:id/get', gallery.get);
router.delete('/:id/delete', gallery.del);
router.put('/:id/update', gallery.update);
router.get('/get', gallery.getAll);
router.get('/getByShopId', gallery.getByShopId);

module.exports = router