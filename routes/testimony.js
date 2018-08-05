const express = require('express'),
  router = new express.Router(),
  testimonyCtrl = require('../controllers/testimony');

router.route('/')
  .get(testimonyCtrl.index)

router.route('/list')
  .get(testimonyCtrl.list)

module.exports = router;
