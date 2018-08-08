const express = require('express'),
  router = new express.Router();

module.exports = (io) => {

  const testimonyCtrl = require('../controllers/testimony')(io);

  router.route('/')
    .get(testimonyCtrl.index)
    .post(testimonyCtrl.create)

  router.route('/list')
    .get(testimonyCtrl.list)

  return router
};
