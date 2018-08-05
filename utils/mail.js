const nodemailer = require('nodemailer'),
  mgTransport = require('nodemailer-mailgun-transport'),
  ejs = require('ejs');

exports.sendEmail = (recipient, subject, template, contextObj = {}) =>{
  new Promise((resolve, reject) => {
    const data = {
      from: 'Crypto-Palace <info@cryptopalace.com>',
      to: recipient,
      subject: subject,
      'h:Reply-To': 'noreply@cryptopalace.com',
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
};
