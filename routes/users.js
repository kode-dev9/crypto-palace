const express = require('express'),
  router = new express.Router(),
  userCtrl = require('../controllers/user');

router.route('/')
  .get(userCtrl.index)

router.route('/list')
  .get(userCtrl.list)

module.exports = router;
