const {validateForm} = require('../utils/validation'),
  {User} = require('../db/models'),
  bcrypt = require('bcrypt');

module.exports = {
  index: (req, res) => {
    res.render('backend/profile')
  }
};
