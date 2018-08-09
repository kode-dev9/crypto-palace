/**
 * This module contains all api routing.
 **/

const express = require('express'),
  router = new express.Router(),
  accountCtrl = require('../controllers/account'),
  {isAuthenticated, authCheck, isAdmin} = require('../middlewares/auth'),
  {siteSetting} = require('../middlewares/settings'),
  lostPasswordCtrl = require('../controllers/lostPassword'),
  referralCtrl = require('../controllers/referrals'),
  notificationCtrl = require('../controllers/notification'),
  agentCtrl = require('../controllers/agent'),
  tradingCtrl = require('../controllers/trading');

const { sendEmail } = require('../utils/mail');

module.exports = (io) => {

  router.route('/test')
    .get((req, res) => {


      io.sockets.on('connection', function (socket) {
        console.log('A client is connected!');
        socket.emit('newNotification.1', {message: 'A user just registered under your referral.'});
      });
      res.send("Hello my dear friend")
    })

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
    .get(accountCtrl.profile);

  router.route('/profile/details')
    .get(accountCtrl.show)

  router.route('/profile/edit')
    .post(accountCtrl.updateDetails);

  router.route('/profile/edit/image')
    .post(accountCtrl.updateProfileImage)

  router.route('/dashboard')
    .get(accountCtrl.index);

  router.route('/access/reject')
    .get((req, res) => {
      res.render('accessDenial', {message: req.flash('message')})
    });

  router.use('/reviews', require('./testimony')(io))

  router.route('/referrals')
    .get(referralCtrl.index)

  router.route('/notifications/unread')
    .get(notificationCtrl.listShow)

  router.route('/notifications')
    .get(notificationCtrl.index)

  router.route('/notifications/:id')
    .get(notificationCtrl.show)

  router.route('/packages')
    .get(tradingCtrl.packages)

  /*
  * Admin routing
  */
  router.use(isAdmin);
  router.route('/admin/setting')
    .get(settingCtrl.indexAdmin);

  router.use('/admin/users', require('./users'))

  router.route('/agents')
    .post(agentCtrl.save)

  return router
};
