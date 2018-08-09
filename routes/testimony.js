const express = require('express'),
  router = new express.Router();

module.exports = (io) => {

  const testimonyCtrl = require('../controllers/testimony')(io);

  router.route('/')
    .get(testimonyCtrl.index)
    .post(testimonyCtrl.create)
    .patch(testimonyCtrl.approve)
    .put(testimonyCtrl.destroy);

  router.route('/list')
    .get(testimonyCtrl.list)

  return router
};
