const models = require('../db/models'),
  refferalLink = require('../utils/referralToken'),
  redis = require('redis');


const redisClient = redis.createClient({host : 'localhost', port : 6379});

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
          $sort: { id: 1 }
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
  }
};
