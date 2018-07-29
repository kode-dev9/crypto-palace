const crypto = require('crypto');
const redis = require('redis');

const client = redis.createClient({host : 'localhost', port : 6379});

let lostPassToken = (user) => {
  return new Promise((resolve, reject) => {
    try {
      crypto.randomBytes(64, function(err, buf) {
        let token = buf.toString('hex');
        client.set("lostPass."+user, token); // add token to redis store
        client.expire("lostPass."+user, 60*60*48); //add expiration of 48 hours to the token

        resolve(token)
      });
    }catch(err){
      let result = new Error('Could not generate token.');
      reject(result)
    }
  })
};

module.exports = lostPassToken;
