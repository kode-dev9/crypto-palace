const {validateForm} = require('../utils/validation'),
  models = require('../db/models'),
  bcrypt = require('bcrypt'),
  verificationToken = require('../utils/verificationToken'),
  refferalLink = require('../utils/referralToken')
  twoFA = require('../utils/2faToken');

const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost', port : 6379});

const { sendEmail } = require('../utils/mail');

module.exports = (io) => {
  return {
  index: (req, res) => {
    var token
    var uid

    if(req.query.token && req.query.uid){
      token = req.query.token
      uid = req.query.uid
    }
    res.render('auth/signup', {uid: uid, token: token})
  },
  create: (req, res) => {
    validateForm.validateSignup({
      fields: {
        email: {val: req.body.email, message: 'E-mail address is required.'},
        password: {val: req.body.password, message: 'Please enter password.'},
        name: {val: req.body.name, message: 'Please enter your name.'},
        firstName: {val: req.body.firstName, message: 'First Name is required.'},
        lastName: {val: req.body.lastName, message: 'Last Name is required.'},
        country: {val: req.body.country, message: 'Please enter country.'},
        bitcoinAddress: {val: req.body.bitcoinAddress, message: 'Bitcoin address is required.'}
      }
    }, (err) => {
      if (err) return res.status(422).json({success: false, response: err})

      models.User.findOne({where: {email: req.body.email}}).then(user => {
        if(user) return res.status(409).json({success: false, response: 'Email address already taken.'});

        models.User.findOne({where: {name: req.body.name}}).then(user => {
          if(user) return res.status(409).json({success: false, response: 'Username already in use.'});

          models.User.findOne({where: {bitcoinAddress: req.body.bitcoinAddress}}).then(user => {
            if(user) return res.status(409).json({success: false, response: 'Bitcoin Address already in use.'})

            let hashedPassword = bcrypt.hashSync(req.body.password, 10); // generate hashed password

              refferalLink(req.body.email).then(link => {
                models.User.create({
                  name: req.body.name,
                  email: req.body.email,
                  password: hashedPassword,
                  bitcoinAddress: req.body.bitcoinAddress,
                  lastName: req.body.lastName,
                  firstName: req.body.firstName,
                  country: req.body.country
                }).then(user => {
                  verificationToken(req.body.email)
                    .then(token => {
                    //send mails
                    let encodedMail = new Buffer(req.body.email).toString('base64');
                    let verificationLink = 'http://'+req.get('host')+'/verify?m='+encodedMail+'&id='+token;
                    console.log(verificationLink)
                    let verifyMail = async () => {
                      try {
                        await sendEmail('confiyobo@gmail.com',
                          'CryptPalace - Account Setup',
                          'accountVerification',
                          {verificationLink: verificationLink});

                        console.log('MAIL GREETING')
                      }catch (e) {
                        console.log('Mail Error', e)
                      }
                    };

                    verifyMail()
                  }).catch(err => console.log("COULD NOT SEND MAIL."));

                  let newUserMail = async () => {
                    try {
                      await sendEmail('confiyobo@gmail.com',
                        'CryptPalace - New user',
                        'newUserAlert');

                      console.log('MAIL GREETING')
                    }catch (e) {
                      console.log('Mail Error', e)
                    }
                  };

                  newUserMail()

                  if(req.body.referralToken && req.body.uid){
                    let userEmail = new Buffer(req.body.referralToken, 'base64').toString('ascii');

                    redisClient.exists('refferalLink.'+userEmail,function(err,result) {
                      if(!err) {
                        if(result === 1) {
                          redisClient.get('refferalLink.'+userEmail,function(err,result){

                            if(result === '?uid='+req.body.uid+'&token='+req.body.referralToken){

                              models.User.findOne({where: { email: userEmail}}).then(refferalUser => {
                                models.Refferal.create({
                                  referral: refferalUser.id,
                                  user: user.id
                                }).then(refferal => {
                                  let msg = 'A user '+user.name+', has registered under your referral link.<br>Referral bonus will be received once he/she completes a transaction.'
                                  models.Notification.create({
                                    recipient: refferalUser.id,
                                    title: 'New Referral',
                                    message: msg
                                  }).then(notification => {
                                    io.on('connection', function(socket){
                                      io.emit('newNotification.'+notification.recipient, {message: msg})
                                    })

                                    models.User.update({
                                      referred: true
                                    }, {where: {
                                      id: user.id
                                    }})

                                    models.User.update({
                                      totalReferrals: models.Sequelize.literal('totalReferrals + 1')
                                    }, {where: {id: refferalUser.id}}).then(user => {

                                    })


                                  })
                                })
                              })
                            }
                          });
                        }
                      }
                    });
                  }
                  res.status(200).json({success: true, response: 'Account created successfully. Please use the link sent to email address to complete your account setup.'})
                })
              })
          })
        })
      })
    })
  },
  resendVerificationToken: (req, res) => {
    let email = req.query.email;

    models.User.findOne({where: {email: email}}).then(user => {
      if(!user) return res.render('auth/accountVerification', {message: 'Verification link could not be resent.'});

      if(user.isActive) return res.render('auth/accountVerification', {message: 'Accont already verified.'})
      verificationToken(user.email)
        .then(token => {
          //send mails
          let encodedMail = new Buffer(email).toString('base64');
          let verificationLink = 'http://'+req.get('host')+'/verify?m='+encodedMail+'&id='+token;
          console.log(verificationLink)
          let verifyMail = async () => {
            try {
              await sendEmail('confiyobo@gmail.com',
                'CryptPalace - Account Verification',
                'accountVerification',
                {verificationLink: verificationLink});

              console.log('MAIL GREETING')
            }catch (e) {
              console.log('Mail Error', e)
            }
          };

          verifyMail()

          return token
        })
        .catch(err => console.log("COULD NOT SEND MAIL."));

        res.render('auth/accountVerification', {message: 'Verification link resent.'})
    });
  },
  verifyAccount: (req, res) => {
    let accountToken = req.query.id;
    let email = req.query.m;

    if(accountToken && accountToken !== '' && email && email !== ''){
      let decodedEmail = new Buffer(email, 'base64').toString('ascii');

      models.User.findOne({where: {email: decodedEmail}}).then(user => {
        if(!user) return res.render('auth/accountVerification', {message: 'Invalid verification link.'});

        if(user.isActive) return res.render('auth/accountVerification', {message: 'Account already verified.'});

        return redisClient.exists('verificationToken.'+decodedEmail,function(err,result) {
          if(!err) {
            if(result === 1) {
              //verify the user account
              models.User.update({'isActive': 1}, {where: {email: decodedEmail}}).then(user => {

                redisClient.del('verificationToken.'+user.email)
                return res.render('auth/accountVerification', {message: 'Account verified successfully.'});
              });

            } else {
              let resendLink = 'http://'+req.get('host')+'/resend/verification?email='+decodedEmail
              return res.render('auth/accountVerification', {message: "Verification link expired. <a href='"+resendLink+"'>Resend Verification Link</a>"})
            }
          }
        });
      });
    }else {
      res.send(404)
    }
  },
  authenticate: (req, res) => {
    validateForm.validateLogin({
      fields: {
        email: {val: req.body.email, message: 'E-mail address is required.'},
        password: {val: req.body.password, message: 'Please enter password.'}
      }
    }, (err) => {
      if(err) return res.status(422).json({success: false, response: err});

      models.User.findOne({where: {email: req.body.email.trim()}}).then(user => {
        if(!user) return res.status(422).json({success: false, response: "Account does not exist."});

        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if(!passwordIsValid) {
          return res.status(422).json({success: false, response: "E-mail address and password do not match."});
        }

        //check if this account has been verified
        let resendLink = 'http://'+req.get('host')+'/resend/verification?email='+req.body.email.trim()
        if(!user.isActive) return res.status(422).json({success: false, response: "Your account has not be verified. Check your email or <a href='"+resendLink+"'>Resend Verification Link</a>"});

        redisClient.exists('twoFactorToken.'+user.email,function(err,result) {
          if(!err) {
            if(result === 1) {
              redisClient.del('twoFactorToken.'+user.email)
            }
          }
        });

        twoFA(user)
          .then(token => {
            //send mails
            let encodedMail = new Buffer(user.email).toString('base64');
            let link = 'http://'+req.get('host')+'/2fa?m='+encodedMail+'&id='+token;
            console.log(link)

            let tfaMail = async () => {
              try {
                await sendEmail('confiyobo@gmail.com',
                  'CryptPalace - 2 Factor Authentication',
                  'tfa',
                  {tfaLink: link});

                console.log('MAIL GREETING')
              }catch (e) {
                console.log('Mail Error', e)
              }
            };

            tfaMail()
          })
          .catch(err => console.log("COULD NOT SEND MAIL."));

        return res.status(200).json({success: true, response: '2Factor Authentication token has been sent to your email address, please use it to access your account.'})
      })
    })
  },
  signin: (req, res) => {
    res.render('auth/signin');
  },
  tfa: (req, res) => {
    let token = req.query.id;
    let email = req.query.m;

    if(token && token !== '' && email && email !== ''){
      let decodedEmail = new Buffer(email, 'base64').toString('ascii');

      models.User.findOne({where: {email: decodedEmail}}).then(user => {
        if(!user) return res.render('auth/2fa', {message: 'Request not authenticated.'});

        return redisClient.exists('twoFactorToken.'+user.email,function(err,result) {
          if(!err) {
            if(result === 1) {
              redisClient.get('twoFactorToken.'+user.email,function(err,result){
                if(result !== token+'-'+user.id) return res.render('auth/2fa', {message: 'Incorrect verification link.'})
                redisClient.del('twoFactorToken.'+user.email)

                req.session.user = user.id;
                res.redirect('/dashboard');
              });
            } else {
              return res.render('auth/2fa', {message: 'Verification link expired.'})
            }
          }
        });
      });
    }else {
      res.send(404)
    }
  }
}

};
