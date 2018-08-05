const {validateForm} = require('../utils/validation'),
  {User} = require('../db/models'),
  bcrypt = require('bcrypt');

module.exports = {
  index: (req, res) => {
    User.findById(req.session.user).then(user => {
      return res.render('backend/profile', {user: user})
    })
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

    User.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bitcoinAddress: req.body.bitcoinAddress
    }, {where: {
      id: req.session.user
    }}).then(user => {
      if(!user) return res.status(422).json({success: false, response: 'Could not comleted request.'})

      res.status(200).json({success: true, response: 'Profile updated!'})
    })
  });
},
updatePassword: (req, res) => {
  validate.validateProfilePassword({
    fields: {
      password: {val: req.body.firstName, message: 'Password is required.'},
      confirmPassword: {val: req.body.confirmPassword}
    }
  }, (err) => {
    if(err) return res.status(422).json({success: false, response: err})

    let hashPassword = bcrypt.hashSync(req.body.password, 10);

    User.update({
      password: hashPassword
    }, {where: {
      id: req.session.user
    }}).then(user => {
      if(!user) return res.status(422).json({success: false, response: 'Password update could not be made.'})

      res.json({success:true, response: 'Password changed!'})
    })
  })
},
updateProfileImage: (req, res) => {
  if(!req.files.profileImage) return res.status(422).json({success: false, response: 'No image selected.'})

  let profileImage = req.files.profileImage;

  const ext = profileImage.mimetype.split('/')[1];
  const newImageName = 'User' + '-' + Date.now() + '.'+ext;

  profileImage.mv('public/uploads/images/profile/'+newImageName, function(err) {
    if (err) 
      return res.status(422).json({success: false, response: err.Error})

  User.update({
    profilePhoto: 'public/uploads/images/profile/'+newImageName
  }, {where: {
    id: req.session.user
  }}).then(user => {
    res.status(200).json({success: true, response: 'Profile image uploaded.'});
  })

  });
}
};
