const express = require('express')
const feedbackCrtl = require('../controller/feedback.controllor')
const router = express.Router();

router.post('/create', feedbackCrtl.create);
router.get('/:id/get', feedbackCrtl.get);
router.delete('/:id/delete', feedbackCrtl.del);
router.put('/:id/update', feedbackCrtl.update);
router.get('/get', feedbackCrtl.getAll);

module.exports = router