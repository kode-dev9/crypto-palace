const createError = require('http-errors'),
  express = require('express'),
  logger = require('morgan'),
  helmet = require('helmet'),
  expressSanitizer = require('express-sanitizer'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  session = require('express-session'),
  RedisStore = require("connect-redis")(session),
  redis = require("redis").createClient(),
  path = require('path'),
  flash = require('connect-flash');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('trust proxy', 1); // trust first proxy
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
var sess = {
  key: 'user_sid',
  secret: 'TicTac Toe - Secret',
  saveUninitialized: true,
  resave: true,
  httpOnly: true,
  cookie: { maxAge: 1200000 },
  store: new RedisStore({ host: 'localhost', port: 6379, client: redis })
};
app.use(flash());
app.use(expressSanitizer());
//app.use(helmet())
app.use(express.static(path.join(__dirname, 'public/src')));
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess))

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

app.use('', require('./routes'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
});

//error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('errors/error')
// });

module.exports = app;
