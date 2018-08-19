const crypto = require('crypto');
const redis = require('redis');

const client = redis.createClient({host : 'localhost', port : 6379});
client.auth(process.env.REDIS_PASSWORD, function (err) { if (err) throw err; });

let refferalLink = (user) => {
return new Promise((resolve, reject) => {
    try {
    crypto.randomBytes(11, function(err, buf) {
        let token = buf.toString('hex');
        let hashEmail = new Buffer(user).toString('base64')
        let link = '?uid='+token+'&token='+hashEmail
        client.set("refferalLink."+user, link); // add link to redis store

        resolve(link)
    });
    }catch(err){
    let result = new Error('Could not generate token.');
    reject(result)
    }
})
};

module.exports = refferalLink;
