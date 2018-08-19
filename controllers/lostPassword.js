const {validateForm} = require('../utils/validation'),
  {User} = require('../db/models'),
  lostPassToken = require('../utils/lostPasswordToken'),
  bcrypt = require('bcrypt');

const redis = require('redis');
const redisClient = redis.createClient({host : 'localhost', port : 6379});
redisClient.auth(process.env.REDIS_PASSWORD, function (err) { if (err) throw err; });

module.exports = {
  index: (req, res) => {
    res.render('auth/password/lostpassword', {message: req.flash('message')});
  },
  checkEmail: (req, res) => {
    validateForm.validateLostPassword({
      fields: {
        email: {val: req.body.email, message: 'E-mail address is required.'}
      }
    }, (err) => {
      if (err) return res.status(422).json({success: false, response: err});

      User.findOne({where: {email: req.body.email}}).then(user => {
        if(!user) return res.status(422).json({success: false, response: 'No account found with this credential.'});

        if(!user.isActive) return res.status(422).json({success: false, response: 'You must verify your account before you can make this request.'});

        lostPassToken(req.body.email)
          .then(token => {
            //send mails
            let encodedMail = new Buffer(req.body.email).toString('base64');
            let resetLink = 'http://'+req.get('host')+'/lost-password/reset?m='+encodedMail+'&id='+token;
            console.log(resetLink)
          })
          .catch(err => console.log("COULD NOT SEND MAIL."));

        res.status(200).json({success: true, response: 'Password reset link has been sent to your email address.'})
      })
    });
  },
  resetPage: (req, res) => {
    let email = req.query.m;
    let resetToken = req.query.id;

    if(resetToken && resetToken !== '' && email && email !== ''){
      let newEmail = new Buffer(email, 'base64').toString('ascii');

      return redisClient.exists('lostPass.'+newEmail,function(err,result) {
        if (!err) {
          if (result === 1) {
            res.render('auth/password/reset', { email: newEmail, message: ''})
          } else {
            req.flash('message', 'Invalid or expired reset link.')
            return res.redirect('/lost-password')
          }
        }
      });
    }else {
      res.send(404);
    }
  },
  reset: (req, res) => {
    validateForm.validateResetPassword({
      fields: {
        confirmPassword: {val: req.body.confirmPassword},
        password: {val: req.body.password, message: 'E-mail address is required.'}
      }
    }, (err) => {
      if (err) return res.status(422).json({success: false, response: err});

      User.findOne({where: {email: req.body.email.trim()}}).then(user => {
        if(!user) return res.status(422).json({success: false, response: 'Request could not be validated.'});

        let hashedPassword = bcrypt.hashSync(req.body.password, 10);

        User.update({password: hashedPassword}, {where: {email: req.body.email.trim()}}).then(user => {
          redisClient.del('lostPass.'+req.body.email.trim(), function(err, result){})
          res.status(200).json({success: true, response: 'New password set.'})
        })
      })
    });
  }
};
