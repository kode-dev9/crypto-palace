/*
 * This module will generate user account verification token.
 * Generated tokens will be stored in the redis store.
 */

const crypto = require('crypto');
const redis = require('redis');

const client = redis.createClient({host : 'localhost', port : 6379});

let generateToken = (user) => {
  return new Promise((resolve, reject) => {
    try {
      crypto.randomBytes(64, function(err, buf) {
        let token = buf.toString('hex');
        client.set("verificationToken."+user, token); // add token to redis store
        client.expire("verificationToken."+user, 60*60*48); //add expiration of 48 hours to the token

        resolve(token)
      });
    }catch(err){
      let result = new Error('Could not generate token.');
      reject(result)
    }
  })
};

module.exports = generateToken;
