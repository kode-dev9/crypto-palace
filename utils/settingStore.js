const redis = require('redis');


class SettingService extends redis.RedisClient {
  constructor() {
    super();
    this.client = redis.createClient({host : 'localhost', port : 6379}); //initialize redis client
    redis.auth("Waplord@777", function (err) { if (err) throw err; });
  }

  get() {
    return new Promise((resolve, reject) => {
      // return this.client.get("sett:crypto-palace.", (err, res) => {
      //   if(err) return reject(err);
      //   else return resolve(res);
      // });

      return this.client.get("sett:crypto-palace.siteName", (err, resName) => {
        return this.client.get("sett:crypto-palace.siteOwner", (err, siteOwner) => {
          return this.client.get("sett:crypto-palace.siteDescription", (err, siteDescription) => {
            return this.client.get("sett:crypto-palace.siteMail", (err, siteMail) => {
              return this.client.get("sett:crypto-palace.facebookUri", (err, facebookUri) => {
                return this.client.get("sett:crypto-palace.twitterUri", (err, twitterUri) => {
                  return this.client.get("sett:crypto-palace.googleUri", (err, googleUri) => {
                    return this.client.get("sett:crypto-palace.bitcoinAddress", (err, bitcoinAddress) => {
                      return this.client.get("sett:crypto-palace.qrCode", (err, qrCode) => {
                    if(err) return reject(err);
                    else return resolve({
                      siteName: resName,
                      siteOwner: siteOwner,
                      siteDescription: siteDescription,
                      siteMail: siteMail,
                      facebookUri: facebookUri,
                      twitterUri: twitterUri,
                      googleUri: googleUri,
                      bitcoinAddress: bitcoinAddress,
                      qrCode: qrCode
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
    })
  }

  save(data){
    return new Promise((resolve, reject) => {
      this.client.set("sett:crypto-palace.siteName", data.siteName);
      this.client.set("sett:crypto-palace.siteOwner", data.siteOwner);
      this.client.set("sett:crypto-palace.siteDescription", data.siteDescription);
      this.client.set("sett:crypto-palace.siteMail", data.siteMail);
      this.client.set("sett:crypto-palace.facebookUri", data.facebookUri);
      this.client.set("sett:crypto-palace.twitterUri", data.twitterUri);
      this.client.set("sett:crypto-palace.googleUri", data.googleUri);
      this.client.set("sett:crypto-palace.bitcoinAddress", data.bitcoinAddress);
      resolve(data)
    });
  }

  saveQr(data){
    return new Promise((resolve, reject) => {
      this.client.set("sett:crypto-palace.qrCode", data.qrCode);
      resolve(data)
    });
  }

  // delete token from sore
  delete(key){
    return new Promise((resolve, reject) => {
      return this.client.del("sett:crypto-palace."+key, (err, res) => {
        if(err) return reject(err);
        else return resolve(true);
      });
    });
  }
}

module.exports = {
  SettingStore: new SettingService()
};
