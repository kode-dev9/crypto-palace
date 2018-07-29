module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) { return next(); }
    console.log('Not Authed')
    res.redirect('/signin');
  },
  authCheck: (req, res, next) => {
    console.log("ME");
    if (req.session.user && req.cookies.user_sid) {
      return res.redirect('/dashboard');
    } else {
      next();
    }
  }
};
