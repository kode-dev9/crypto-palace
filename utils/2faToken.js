const crypto = require('crypto');
const redis = require('redis');

const client = redis.createClient({host : 'localhost', port : 6379});

let TwoFactorToken = (user) => {
  return new Promise((resolve, reject) => {
    try {
      crypto.randomBytes(9, function(err, buf) {
        let token = buf.toString('hex');
        client.set("twoFactorToken."+user.email, token+'-'+user.id); // add token to redis store
        client.expire("twoFactorToken."+user, 60*60*2); //add expiration of 2 hours to the token

        resolve(token)
      });
    }catch(err){
      let result = new Error('Could not generate token.');
      reject(result)
    }
  })
};

module.exports = TwoFactorToken;
