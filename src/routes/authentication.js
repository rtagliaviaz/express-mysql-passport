const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../database');
const {isLoggedIn, isNotLoggedIn, isAdmin} = require('../lib/auth')

router.use(function(req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

//signup
router.get('/signup', isNotLoggedIn, (req, res) => {
  res.render("auth/signup")
})

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
}))


//signin
router.get('/signin', isNotLoggedIn, (req, res) => {
  res.render('auth/signin')
})

router.post('/signin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local.signin',{
    successRedirect: '/profile',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next) 
  });

//admin signin
router.get('/admin', isNotLoggedIn, (req, res) => {
  res.render('auth/admin')
})


router.post('/admin', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local.signin', {
    successRedirect: '/dashboard',
    failureRedirect: '/admin',
    failureFlash: true
  })(req, res, next);
});


//profile
router.get('/profile', isLoggedIn, async (req, res) => {
  const userData = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id])
  res.render('clients/profile', {userData});
});

//dashboard
router.get('/dashboard', isAdmin, (req, res) => {
  res.render('admin/dashboard');
})

//logout
router.get('/logout', isLoggedIn, (req,res) => {
  req.logOut();
  res.redirect('/signin');
});

module.exports = router; 