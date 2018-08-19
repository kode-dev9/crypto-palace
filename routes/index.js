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
  agentCtrl = require('../controllers/agent');

const { sendEmail } = require('../utils/mail');

module.exports = (io) => {

  const settingCtrl = require('../controllers/setting')(io);
  const authCtrl = require('../controllers/auth')(io);
  const supportCtrl = require('../controllers/support')(io);
  const tradingCtrl = require('../controllers/trading')(io);

  router.route('/site/setting')
    .put(settingCtrl.save);

  router.route('/setting/site')
    .get(settingCtrl.index);

  router.route('/site/setting/qrcode')
    .post(settingCtrl.saveQr);

  router.use(siteSetting);
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
    .get(settingCtrl.index);

  router.route('/site/setting/qrcode')
    .put(settingCtrl.saveQr);


  router.use(isAuthenticated);
  router.route('/profile')
    .get(accountCtrl.profile);

  router.route('/profile/details')
    .get(accountCtrl.show);

  router.route('/profile/edit')
    .post(accountCtrl.updateDetails);

  router.route('/profile/edit/image')
    .post(accountCtrl.updateProfileImage);

  router.route('/dashboard')
    .get(accountCtrl.index);

  router.route('/access/reject')
    .get((req, res) => {
      res.render('accessDenial', {message: req.flash('message')})
    });

  router.use('/reviews', require('./testimony')(io));

  router.route('/referrals')
    .get(referralCtrl.index);

  router.route('/notifications/unread')
    .get(notificationCtrl.listShow);

  router.route('/notifications')
    .get(notificationCtrl.index);

  router.route('/notifications/:id')
    .get(notificationCtrl.show);

  router.route('/packages')
    .get(tradingCtrl.packages);

  router.route('/support')
    .get(supportCtrl.index);

  router.route('/trading/start')
    .post(tradingCtrl.start);

  router.route('/trading/payment/:id')
    .get(tradingCtrl.paymentPage);

  router.route('/trading/payment/completed')
    .post(tradingCtrl.savePayment);

  router.route('/transactions')
    .get(tradingCtrl.transactions);

  router.route('/trading/transactions')
    .get(tradingCtrl.transactionList);

  router.route('/wallet/withdraw')
    .post(tradingCtrl.withdraw)

  router.route('/trading/transaction/details')
    .get(tradingCtrl.wallet);

  router.route('/referral/withdraw')
    .post(referralCtrl.pressWithdrawal);

  router.route('/withdraw/referral')
    .get(referralCtrl.withdrawView);

  /*
  * Admin routing
  */
  router.use(isAdmin);
  router.route('/admin/setting')
    .get(settingCtrl.indexAdmin);

  router.route('/transaction/payment')
    .post(tradingCtrl.paymentAction);

  router.use('/admin/users', require('./users'));

  router.route('/agents')
    .post(agentCtrl.save);

  return router
};
