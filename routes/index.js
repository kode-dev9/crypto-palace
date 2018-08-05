/**
 * This module contains all api routing.
 **/

const express = require('express'),
  router = new express.Router(),
  accountCtrl = require('../controllers/account'),
  {isAuthenticated, authCheck, isAdmin} = require('../middlewares/auth'),
  {siteSetting} = require('../middlewares/settings'),
  lostPasswordCtrl = require('../controllers/lostPassword');

const { sendEmail } = require('../utils/mail');

module.exports = (io) => {

  const settingCtrl = require('../controllers/setting')(io)
  const authCtrl = require('../controllers/auth')(io)
  router.route('/site/setting')
    .put(settingCtrl.save);

  router.route('/setting/site')
    .get(settingCtrl.index)

  router.route('/site/setting/qrcode')
    .post(settingCtrl.saveQr);

  router.use(siteSetting)
  //Begin authentication routing
  router.route('/signup')
    .get(authCheck, authCtrl.index)
    .post(authCtrl.create);

  router.route('/signin')
    .get(authCheck, authCtrl.signin)
    .post(authCtrl.authenticate);

  router.route('/resend/verification')
    .get(authCtrl.resendVerificationToken);

  router.route('/verify')
    .get(authCtrl.verifyAccount);

  router.route('/lost-password')
    .get(authCheck, lostPasswordCtrl.index)
    .post(lostPasswordCtrl.checkEmail);

  router.route('/lost-password/reset')
    .get(authCheck, lostPasswordCtrl.resetPage)
    .post(lostPasswordCtrl.reset);

  router.route('/2fa')
    .get(authCtrl.tfa);

  //End authentication routing

  router.route('/')
    .get((req, res) => {
      res.render('index')
    });

  router.route('/signout')
    .post((req, res) => {
      if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        req.session.destroy(function(err) {
          if(err) {
            return next(err);
          } else {
            return res.redirect('/signin');
          }
        });
      } else {
        res.redirect('/signin');
      }
  });

  router.route('/site/setting')
    .put(settingCtrl.save);

  router.route('/setting/site')
    .get(settingCtrl.index)

  router.route('/site/setting/qrcode')
    .put(settingCtrl.saveQr);


  router.use(isAuthenticated);
  router.route('/profile')
    .get(accountCtrl.index);

  router.route('/dashboard')
    .get(accountCtrl.index);

  router.use('/testimony', require('./testimony'))

  /*
  * Admin routing
  */
  router.use(isAdmin);
  router.route('/admin/setting')
    .get(settingCtrl.index);

  router.use('/admin/users', require('./users'))

  return router
};
