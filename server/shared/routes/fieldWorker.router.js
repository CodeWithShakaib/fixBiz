const express = require('express')
const fieldWorkerCrtl = require('../controller/fieldWorker.controller')
const router = express.Router();

router.post('/create', fieldWorkerCrtl.create);
router.get('/:id/get', fieldWorkerCrtl.get);
router.delete('/:id/delete', fieldWorkerCrtl.del);
router.put('/:id/update', fieldWorkerCrtl.update);
router.get('/get', fieldWorkerCrtl.getAll);
router.get('/getShops', fieldWorkerCrtl.getShopsByFieldWorkerId);

module.exports = router