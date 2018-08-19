const {SettingStore} = require('../utils/settingStore'),
    redis = require("redis").createClient();

module.exports = {
siteSetting: (req, res, next) => {
    redis.exists('sett:crypto-palace.siteName', (err, result) => {
        if(result === 1){
            next()
        }else{
            res.redirect('/setting/site')
        }
    })
}
};
