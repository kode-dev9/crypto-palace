const {User} = require('../db/models'),
  { validateForm } = require('../utils/validation'),
  randomPassword = require('../utils/randomPassword'),
  verificationToken = require('../utils/verificationToken'),
  bcrypt = require('bcrypt');

const crypto = require('crypto');

const { sendEmail } = require('../utils/mail');

module.exports = {
  save: (req, res) => {
    validateForm.validateAgent({
      fields: {
        email: {val: req.body.email, message: 'E-mail address is required.'},
        name: {val: req.body.name, message: 'Please enter your name.'},
        firstName: {val: req.body.firstName, message: 'First Name is required.'},
        lastName: {val: req.body.lastName, message: 'Last Name is required.'},
        country: {val: req.body.country, message: 'Please enter country.'},
        bitcoinAddress: {val: 'TEXT', message: 'Bitcoin address is required.'}
      }
    }, (err) => {
      if (err) return res.status(422).json({success: false, response: err})

      User.findOne({where: {email: req.body.email}}).then(user => {
        if(user) return res.status(409).json({success: false, response: 'Email address already taken.'});

        User.findOne({where: {name: req.body.name}}).then(user => {
          if(user) return res.status(409).json({success: false, response: 'Username already in use.'});

          crypto.randomBytes(9, function(err, buf) {
            let password = buf.toString('hex');

            let hashedPassword = bcrypt.hashSync(password, 10); // generate hashed password

            verificationToken(req.body.email)
              .then(token => {
                //send mails
                let encodedMail = new Buffer(req.body.email).toString('base64');
                let verificationLink = 'http://'+req.get('host')+'/verify?m='+encodedMail+'&id='+token;
                console.log(verificationLink)
                let verifyMail = async () => {
                  try {
                    await sendEmail('confiyobo@gmail.com',
                      'CryptPalace - Agent Account Setup',
                      'agentAccountVerification',
                      {verificationLink: verificationLink, password: password});

                    console.log('MAIL GREETING')
                  }catch (e) {
                    console.log('Mail Error', e)
                  }
                };

                verifyMail()
              })
              .catch(err => console.log("COULD NOT SEND MAIL."));

            return User.create({
              name: req.body.name,
              email: req.body.email,
              password: hashedPassword,
              bitcoinAddress: ' ',
              lastName: req.body.lastName,
              firstName: req.body.firstName,
              country: req.body.country,
              adminType: 2
            }).then(user => {

              res.status(200).json({success: true, response: 'Account created successfully. Agent will be notified to further complete his/her account setup.', payload: user})
            })
          });

        })
      })
    })
  }
};
