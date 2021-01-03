const express = require('express')
const userCrtl = require('../controller/user.controller')
const review = require('../controller/review.controller')
const router = express.Router();

router.post('/create', review.create);
router.get('/:id/get', review.get);
router.delete('/:id/delete', review.del);
router.put('/:id/update', review.update);
router.get('/get', review.getAll);

module.exports = router