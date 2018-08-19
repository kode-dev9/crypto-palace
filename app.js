const cron = require("node-cron");
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
  {SettingStore} = require('./utils/settingStore'),
    axios = require('axios');

redisClient.auth("Waplord@777", function (err) { if (err) throw err; });
redis.auth("Waplord@777", function (err) { if (err) throw err; });

const fileUpload = require('express-fileupload');
const { sendEmail } = require('./utils/mail');

const app = express();

const User = require('./db/models').User
const models = require('./db/models')
app.io = require('socket.io')();


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
});

let monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

app.use((req, res, next) => {
  if (req.url === '/favicon.ico')
    return res.end()
  res.locals.year = new Date().getFullYear()
  res.locals.monthNames = monthNames;
  next()
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload());
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
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

let timeAgo = (time) => {

  switch (typeof time) {
    case 'number':
      break;
    case 'string':
      time = +new Date(time);
      break;
    case 'object':
      if (time.constructor === Date) time = time.getTime();
      break;
    default:
      time = +new Date();
  }
  let time_formats = [
    [60, 'seconds', 1], // 60
    [120, '1 minute ago', '1 minute from now'], // 60*2
    [3600, 'minutes', 60], // 60*60, 60
    [7200, '1 hour ago', '1 hour from now'], // 60*60*2
    [86400, 'hours', 3600], // 60*60*24, 60*60
    [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
    [604800, 'days', 86400], // 60*60*24*7, 60*60*24
    [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
    [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
    [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
    [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
    [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
    [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
    [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
    [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];
  let seconds = (+new Date() - time) / 1000,
    token = 'ago',
    list_choice = 1;

  if (seconds == 0) {
    return 'Just now'
  }
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  let i = 0,
    format;
  while (format = time_formats[i++])
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
};

app.use((req, res, next) => {
  res.locals.adminId = '';
  res.locals.adminMail = '';

  User.find({where: {
    isAdmin: true, adminType: 1
    }}).then(admin => {
      if(admin){
        res.locals.adminId = admin.id
        res.locals.adminMail = admin.email
      }
  });

  res.locals.timeAgo = (time) => {

    switch (typeof time) {
      case 'number':
        break;
      case 'string':
        time = +new Date(time);
        break;
      case 'object':
        if (time.constructor === Date) time = time.getTime();
        break;
      default:
        time = +new Date();
    }
    let time_formats = [
      [60, 'seconds', 1], // 60
      [120, '1 minute ago', '1 minute from now'], // 60*2
      [3600, 'minutes', 60], // 60*60, 60
      [7200, '1 hour ago', '1 hour from now'], // 60*60*2
      [86400, 'hours', 3600], // 60*60*24, 60*60
      [172800, 'Yesterday', 'Tomorrow'], // 60*60*24*2
      [604800, 'days', 86400], // 60*60*24*7, 60*60*24
      [1209600, 'Last week', 'Next week'], // 60*60*24*7*4*2
      [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
      [4838400, 'Last month', 'Next month'], // 60*60*24*7*4*2
      [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
      [58060800, 'Last year', 'Next year'], // 60*60*24*7*4*12*2
      [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
      [5806080000, 'Last century', 'Next century'], // 60*60*24*7*4*12*100*2
      [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
    ];
    let seconds = (+new Date() - time) / 1000,
      token = 'ago',
      list_choice = 1;

    if (seconds == 0) {
      return 'Just now'
    }
    if (seconds < 0) {
      seconds = Math.abs(seconds);
      token = 'from now';
      list_choice = 2;
    }
    let i = 0,
      format;
    while (format = time_formats[i++])
      if (seconds < format[0]) {
        if (typeof format[2] == 'string')
          return format[list_choice];
        else
          return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
      }
    return time;
  };

  res.locals.isGlobalAdmin = false;
  res.locals.isMinorAdmin = false;
  res.locals.isAdmin = false;

  let images = [
    '/images/carousel/22.jpg',
    '/images/carousel/23.jpg',
    '/images/carousel/24.jpeg',
    '/images/carousel/25.jpg'
  ];

  res.locals.coverThumb = images[Math.floor(Math.random()*images.length)];

  res.locals.userDetails = {}
  if(!req.session.user || !req.cookies.user_sid) return next();

  User.findById(req.session.user).then(user => {
    if(!user) return next();
    res.locals.userDetails = user;
    if(user.isAdmin){
      res.locals.isAdmin = true;

      if(user.adminType === 1){
        res.locals.isGlobalAdmin = true
      }
      else {
        res.locals.isMinorAdmin = true
      }
    }
    return next();
  })
});

app.use((req, res, next) => {
  if(req.session.user){
    //check if user has been blocked or deleted

    User.findById(req.session.user).then(user => {
      if(!user) {
        return res.redirect('/signin');
      }else if(user.isDeleted) {
        req.flash('message', 'This account has been deleted from our platform.')

        return res.redirect('/access/reject');
      }else if(user.isBanned){
        req.flash('message', 'This account has been locked by our admin till further notice.')

        return res.redirect('/access/reject');
      }

    })
  }

  return next();
});

cron.schedule("* * * * *", function() {
  models.Trade.findAll({
    where: {
      status: 1
    }
  }).then(trades => {
    if(!trades) return;

    trades.forEach((trade) => {
      let currentTime = new Date();

      if(currentTime < trade.durationTime){

        if(currentTime >= trade.earningStart){

          if(trade.totalEarnings < trade.earning){
            //let newEarning = (trade.earning / trade.duration)

            User.find({where: {
                isAdmin: true, adminType: 1
              }}).then(admin => {
              if(admin){
                models.Trade.update({
                  totalEarnings: models.Sequelize.literal('totalEarnings + '+trade.dailyEarnings)
                }, {where: {id: trade.id}}).then(result => {

                  models.Trade.findOne({ where: { id: trade.id}, include: [{model: models.User}]}).then(trade => {
                    if(trade.totalEarnings == trade.earning){
                      models.Trade.update({
                        status: 2
                      }, {where: { id: trade.id}}).then(tradeFinish => {
                        let tradingBalance = trade.earning + investing;
                        models.Wallet.update({
                          balance: models.Sequelize.literal('balance + '+tradingBalance),
                          completedTransactions: models.Sequelize.literal('completedTransactions + 1'),
                          ongoingTransactions: models.Sequelize.literal('ongoingTransactions - 1')
                        }, {where: {user: trade.User.id}});
                        let notifyMail = async () => {
                          try {
                            await sendEmail(admin.email,
                              'Transaction Alert',
                              'notificationAlert',
                              {});

                            console.log('MAIL GREETING')
                          }catch (e) {
                            console.log('Mail Error', e)
                          }
                        };

                        notifyMail();

                        let packageDate = trade.createdAt.getDate()+' '+monthNames[trade.createdAt.getMonth()]+' '+trade.createdAt.getFullYear();

                        let msg = trade.User.name+'\'s transaction of '+trade.package+' package initiated on '+packageDate+' has been completed today.';
                        let briefMsg = msg.substr(0, 45);

                        briefMsg = briefMsg.substr(0, Math.min(briefMsg.length, briefMsg.lastIndexOf(" ")));

                        models.Notification.create({
                          recipient: admin.id,
                          title: 'Transaction Completion',
                          message: msg,
                          briefMessage: briefMsg
                        }).then(notification => {
                          app.io.sockets.emit('newNotification.' + notification.recipient, {
                            briefMessage: briefMsg,
                            id: notification.id,
                            createdAt: notification.createdAt,
                            title: notification.title
                          })

                        });

                        //send the mail to the user
                        let notifyMailAdmin = async () => {
                          try {
                            await sendEmail(trade.User.email,
                              'Transaction Alert',
                              'notificationAlert',
                              {});

                            console.log('MAIL GREETING')
                          }catch (e) {
                            console.log('Mail Error', e)
                          }
                        };

                        notifyMailAdmin();

                        let msgNew = 'Your transaction of '+trade.package+' package initiated on '+packageDate+' has been completed today.';
                        let briefMsgNew = msgNew.substr(0, 45);


                        briefMsgNew = briefMsgNew.substr(0, Math.min(briefMsgNew.length, briefMsgNew.lastIndexOf(" ")));

                        models.Notification.create({
                          recipient: trade.User.id,
                          title: 'Transaction Completion',
                          message: msgNew,
                          briefMessage: briefMsgNew
                        }).then(notification => {
                          app.io.sockets.emit('newNotification.' + notification.recipient, {
                            briefMessage: briefMsgNew,
                            id: notification.id,
                            createdAt: notification.createdAt,
                            title: notification.title
                          })

                        });
                      })
                    }
                  });

                  console.log("Done Paying!")
                })
              }
            });
          }
        }
      }
    })
  })
});

app.use('', require('./routes')(app.io));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
});

//error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('errors/error')
});

module.exports = app;
