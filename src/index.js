const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session'); //store data in the server
const MySQLStore = require('express-mysql-session');  //store the session in mysql
const passport = require('passport');
const {database} = require('./keys')

//initializations
const app = express();
require('./lib/passport');

//settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//middlewares
app.use(session({
  cookie: {secure: false},
  secret: 'robmysql',
  resave: false,
  saveUninitialized: false,
  store: MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Global variables
app.use((req, res, next) => {
  app.locals.success = req.flash('success');
  app.locals.error = req.flash('error');
  app.locals.user = req.user;
  next(); 
})

//routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use(require('./routes/users'));

//public
app.use(express.static(path.join(__dirname, 'public')))

//server
app.listen(app.get('port'), () => {
  console.log(`App listening on ${app.get('port')}!`);
});

module.exports = app


