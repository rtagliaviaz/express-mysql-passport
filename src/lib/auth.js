module.exports = {

  isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/signin');
  },

  isNotLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/profile')
  },

  isAdmin(req, res, next) {
    if (req.isAuthenticated() && (req.user.isadmin == 1)) {
      return next();
    }
    return res.redirect('/dashboard');
  }

};
