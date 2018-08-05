const User = require('../db/models').User

module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) { return next(); }
    return res.redirect('/signin');
  },
  authCheck: (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
      return res.redirect('/dashboard');
    } else {
      next();
    }
  },
  isAdmin: (req, res, next) => {
    if(req.session.user && req.cookies.user_sid){
      User.findById(req.session.user).then(user => {
        if(!user) return res.redirect('/signin');

        if(user.isAdmin) return next();

        return res.redirect('/dashboard');
      })
    }else { return res.redirect('/signin'); }
  },
  isGlobalAdmin: (req, res, next) => {
    if(req.session.user && req.cookies.user_sid){
      User.findById(req.session.user).then(user => {
        if(!user) return res.redirect('/signin');

        if(user.isAdmin){
          if(user.adminType === 1){ return next(); }

          return res.redirect('/dashboard');
        }

        return res.redirect('/dashboard');
      })
    }else { return res.redirect('/signin'); }
  }
};
