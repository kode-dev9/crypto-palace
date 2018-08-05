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
  redisClient = require('redis').createClient({host : 'localhost', port : 6379})
  path = require('path'),
  flash = require('connect-flash'),
  {SettingStore} = require('./utils/settingStore');

const fileUpload = require('express-fileupload');

const app = express();

const User = require('./db/models').User
app.io = require('socket.io')();

// io.sockets.on('connection', function (socket) {
//   console.log('A client is connected!');
//   socket.emit('notification.'+notification.recipient, {message: 'A user just registered under your referral.'});
// });

app.use((req, res, next) => {
    const settings = {}

    return redisClient.get("sett:crypto-palace.siteName", (err, resName) => {
      return redisClient.get("sett:crypto-palace.siteOwner", (err, siteOwner) => {
        return redisClient.get("sett:crypto-palace.siteDescription", (err, siteDescription) => {
          return redisClient.get("sett:crypto-palace.siteMail", (err, siteMail) => {
            return redisClient.get("sett:crypto-palace.facebookUri", (err, facebookUri) => {
              return redisClient.get("sett:crypto-palace.twitterUri", (err, twitterUri) => {
                return redisClient.get("sett:crypto-palace.googleUri", (err, googleUri) => {
                  return redisClient.get("sett:crypto-palace.bitcoinAddress", (err, bitcoinAddress) => {
                    return redisClient.get("sett:crypto-palace.qrCode", (err, qrCode) => {
                        settings.siteName = resName
                        settings.siteOwner = siteOwner
                        settings.siteDescription = siteDescription
                        settings.siteMail = siteMail
                        settings.facebookUri = facebookUri
                        settings.twitterUri = twitterUri
                        settings.googleUri = googleUri
                        settings.bitcoinAddress = bitcoinAddress
                        settings.qrCode = qrCode

                        res.locals.settings = settings
                        next()
                    });
                  });
                    });
                  });
                });
              });
            });
          });
        });
})

app.use((req, res, next) => {
  if (req.url === '/favicon.ico')
    return res.end()
  res.locals.year = new Date().getFullYear()
  next()
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload())
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

app.use((req, res, next) => {
  if(!req.session.user || !req.cookies.user_sid) return next();
  console.log("ENTERED")
  User.findById(req.session.user).then(user => {
    if(!user) return next();

    res.locals.userDetails = user
    return next(); 
  })
})

app.use('', require('./routes')(app.io));

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
