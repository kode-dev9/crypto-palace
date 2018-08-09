const crypto = require('crypto');


let randomPassword = (user) => {
  return new Promise((resolve, reject) => {
    try {
      crypto.randomBytes(9, function(err, buf) {
        let password = buf.toString('hex');
        resolve(password)
      });
    }catch(err){
      let result = new Error('Could not generate token.');
      reject(result)
    }
  })
};

module.exports = randomPassword;
