const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('./helpers');


/*
 local.signin
 */
passport.use('local.signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  if (rows.length > 0) {
    const user = rows[0];
    // console.log(user)
    const validPassword = await helpers.matchPassword(password, user.password)
    if (validPassword) {
        done(null, user, req.flash('success', 'Welcome ' + user.email))    
      
    } else {
      done(null, false, req.flash('error', 'Incorrect Password'));
    }
  } else {
    return done(null, false, req.flash('error', 'The username does not exist'));
  }
}))

/*
  local.signup
*/
passport.use('local.signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const newUser = {
    email,
    password
  }

  const duplicateUser = await pool.query('SELECT email FROM users WHERE email = ?', newUser.email);
  if (duplicateUser != 0 ) {
    done(null, false, req.flash('error', 'Username Already Exists'));
    console.log('USERNAME ALREADY EXISTS');
  } else {
    newUser.password = await helpers.encryptPassword(password)

    const result = await pool.query('INSERT INTO users SET ?', [newUser]);
    console.log(result)
    newUser.id = result.insertId;
    return done(null, newUser);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id])
  done(null, rows[0])
})

module.exports = passport