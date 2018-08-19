const nodemailer = require('nodemailer'),
  mgTransport = require('nodemailer-mailgun-transport'),
  ejs = require('ejs'),
  redisClient = require('redis').createClient({host : 'localhost', port : 6379});

redisClient.auth("Waplord@777", function (err) { if (err) throw err; });

exports.sendEmail = (recipient, subject, template, contextObj = {}) =>{
  new Promise((resolve, reject) => {
    redisClient.get("sett:crypto-palace.siteName", (err, resName) => {
      redisClient.get("sett:crypto-palace.siteMail", (err, siteMail) => {
        const data = {
          from: resName+' <'+siteMail+'>',
          to: recipient,
          subject: resName+' - '+subject,
          'h:Reply-To': ''+siteMail,
          //You can use "html:" to send HTML email content. It's magic!
          template: {
            name: 'views/mails/'+template+'.ejs',
            engine: 'ejs',
            context: contextObj
          }
        };

        let auth = {
          auth: {
            api_key: process.env.MAILGUN_APIKEY,
            domain: process.env.MAILGUN_DOMAIN
          },
          //proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
        };

        let nodemailerMailgun = nodemailer.createTransport(mgTransport(auth));

        nodemailerMailgun.sendMail(data, (error, info) => {
          if (error) {
            return reject(error);
          }
          return resolve(info);
        });
      });
    });
  });
};
