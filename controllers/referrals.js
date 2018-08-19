const models = require('../db/models'),
  refferalLink = require('../utils/referralToken'),
  { validateForm } = require('../utils/validation'),
  redis = require('redis');


const redisClient = redis.createClient({host : 'localhost', port : 6379});
redisClient.auth("Waplord@777", function (err) { if (err) throw err; });

module.exports = {
  index: (req, res) => {
    let limit = 9;   // number of records per page
    let offset = 0;

    models.Refferal.findAndCountAll({where: {referral: res.locals.userDetails.id}})
      .then((data) => {
        let page = (req.query.page)?req.query.page:1;      // page number
        let pages = Math.ceil(data.count / limit);
        offset = limit * (page - 1);

        models.Refferal.findAll({
          where: {referral: res.locals.userDetails.id},
          include: [
            { model: models.User}
          ],
          limit: limit,
          offset: offset,
          $sort: { id: 1 },
          order: [ ['createdAt', 'DESC'] ]
        }).then(referral => {

          redisClient.exists('refferalLink.'+res.locals.userDetails.email,function(err,result) {
            if (!err) {
              if (result === 1) {
                redisClient.get('refferalLink.'+res.locals.userDetails.email, function(err, result){
                  res.render('backend/pages/referrals', {referrals: referral, 'count': data.count, current: page, 'pages': pages, referralLink: 'http://'+req.get('host')+'/signup'+result})
                });
              }else {
                refferalLink(res.locals.userDetails.email).then(link => {
                  res.render('backend/pages/referrals', {referrals: referral, 'count': data.count, current: page, 'pages': pages, referralLink: 'http://'+req.get('host')+'/signup'+link})
                })
              }
            }
          })
        });
      })
  },
  withdrawView: (req, res) => {
    res.render('backend/pages/withdrawReferral')
  },
  pressWithdrawal: (req, res) => {
    validateForm.validateWithdrawal({
      fields: {
        amount: {val: req.body.amount, message: 'Please enter amount.'}
      }
    }, (err) => {
      if (err) return res.status(422).json({success: false, response: err});

      if(req.body.amount == 0) return res.status(422).json({success: false, response: 'Amount cannot be 0 BTC'})

      let bitcoinAddress;

      models.User.findById(req.session.user).then(user => {
        if(req.body.bitcoinAddress){
          bitcoinAddress = req.body.bitcoinAddress.trim()
        }else{
          bitcoinAddress = user.bitcoinAddress
        }

        let currentTime = new Date();

        models.Wallet.findOne({where: {user: user.id}}).then(wallet => {
          if(wallet.referralBonus >= req.body.amount){
            models.Wallet.update({
              referralBonus: models.Sequelize.literal('referralBonus - '+req.body.amount)
            }, {where: {user: user.id}}).then(updateWallet => {
              let notifyMail = async () => {
                try {
                  await sendEmail(res.locals.adminMail,
                    'Withdrawal Request',
                    'notificationAlert',
                    {});

                  console.log('MAIL GREETING')
                }catch (e) {
                  console.log('Mail Error', e)
                }
              };

              notifyMail();

              let msg = `A user ${user.name} has requested withdrawal of ${req.body.amount} BTC of his/her referral bonus.
                <br><h4>Details</h4>
                <b>Bitcoin Address</b>: ${bitcoinAddress},<br>
                <b>Amount</b>: ${req.body.amount} BTC
                `;
              let briefMsg = msg.substr(0, 45);


              briefMsg = briefMsg.substr(0, Math.min(briefMsg.length, briefMsg.lastIndexOf(" ")));

              models.Notification.create({
                recipient: res.locals.adminId,
                title: 'Payment Request',
                message: msg,
                briefMessage: briefMsg
              }).then(notification => {
                io.sockets.emit('newNotification.' + notification.recipient, {
                  briefMessage: briefMsg,
                  id: notification.id,
                  createdAt: notification.createdAt,
                  title: notification.title
                })

              });

              res.status(200).json({
                success: true,
                response: 'Withdrawal request sent!'
              })
            })
          }else{
            return res.status(422).json({success: false, response: 'Your balance is not enough, kindly change the amount and try again.'})
          }
        })
      })
    })
  }
};
