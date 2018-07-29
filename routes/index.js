/**
 * This module contains all api routing.
 **/

const express = require('express'),
  router = new express.Router(),
  authCtrl = require('../controllers/auth'),
  accountCtrl = require('../controllers/account'),
  {isAuthenticated, authCheck} = require('../middlewares/auth'),
  lostPasswordCtrl = require('../controllers/lostPassword');

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
  .get((req, res) => {
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

router.route('/testmail')
  .get((req, res) => {
    var nodemailer = require('nodemailer');
    var mg = require('nodemailer-mailgun-transport');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
    var auth = {
      auth: {
        api_key: 'key-65a0b329159d8d5f4e2b01a16ed23d5b',
        domain: 'sandbox1237c07a52b14270b070e179e5460489.mailgun.org'
      },
      //proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
    }

    var nodemailerMailgun = nodemailer.createTransport(mg(auth));

    nodemailerMailgun.sendMail({
      from: 'myemail@example.com',
      to: 'confiyobo@gmail.com',
      subject: 'Hey you, awesome!',
      'h:Reply-To': 'myemail@example.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: '<b>Wow Big powerful letters</b>',
      //You can use "text:" to send plain-text content. It's oldschool!
      text: 'Mailgun rocks, pow pow!'
    }, function (err, info) {
      if (err) {
        console.log('Error: ' + err);
      }
      else {
        console.log('Response: ' + info);
      }

      res.send('hai')
    });
  })


router.use(isAuthenticated);
router.route('/profile')
  .get(accountCtrl.index);

router.route('/dashboard')
  .get(accountCtrl.index);


module.exports = router;
