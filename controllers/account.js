const {validateForm} = require('../utils/validation'),
  {User} = require('../db/models'),
  bcrypt = require('bcrypt');

module.exports = {
  index: (req, res) => {
    User.findById(req.session.user).then(user => {
      return res.render('backend/profile', {user: user})
    })
  },
  profile: (req, res) => {
    return res.render('backend/pages/profile')
  },
  show: (req,res) => {
    User.findById(req.session.user).then(user => {
      res.json(user)
    })
  },
  updateDetails: (req, res) => {

    validateForm.validateProfileDetails({
      fields: {
        firstName: {val: req.body.firstName, message: 'First name is required.'},
        lastName: {val: req.body.lastName, message: 'Last name is required.'},
        bitcoinAddress: {val: req.body.bitcoinAddress, message: 'Bitcoin address is required.'}
      }
    }, (err) => {
      if (err) return res.status(422).json({success: false, response: err});

      if(req.body.password && req.body.password.trim() !== ''){
        if ((!req.body.confirmPassword || req.body.confirmPassword.trim() === '')
          || req.body.password !== req.body.confirmPassword) {
          return res.status(422).json({success: false, response: {password: "Password and retyped don't match."}})
        }


        let hashPassword = bcrypt.hashSync(req.body.password.trim(), 10);

        return User.update({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          bitcoinAddress: req.body.bitcoinAddress,
          password: hashPassword
        }, {where: {
            id: req.session.user
          }}).then(user => {
          if(!user) return res.status(422).json({success: false, response: 'Could not completed request.'})

          res.status(200).json({success: true, response: 'Profile updated!', payload: user})
        })
      }

      User.update({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        bitcoinAddress: req.body.bitcoinAddress
      }, {where: {
          id: req.session.user
        }}).then(user => {
        if(!user) return res.status(422).json({success: false, response: 'Could not completed request.'})

        res.status(200).json({success: true, response: 'Profile updated!', payload: user})
      })
    });
  },
  updateProfileImage: (req, res) => {
    if(!req.files.profileImage) return res.status(422).json({success: false, response: 'No image selected.'})

    let profileImage = req.files.profileImage;

    const ext = profileImage.mimetype.split('/')[1];
    const newImageName = 'Profile' + '-' + Date.now() + '.'+ext;

    profileImage.mv('public/src/uploads/images/profile/'+newImageName, function(err) {
      if (err)
        return res.status(422).json({success: false, response: err.Error})

      User.update({
        profilePhoto: '/uploads/images/profile/'+newImageName
      }, {where: {
          id: req.session.user
        }}).then(user => {
        res.status(200).json({success: true, response: 'Profile image uploaded.'});
      })

    });
  }
};
