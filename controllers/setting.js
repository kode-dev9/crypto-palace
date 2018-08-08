/**
* Index: will display the setting form and allow vue frontend to do the rest
* Save: will handle setting form submission via put*/
const validateForm = require('../utils/validation').validateForm;
const {SettingStore} = require('../utils/settingStore'),
  models = require('../db/models');


module.exports = (io) => {
  return {
    index: (req, res) => {
      if(res.locals.settings.siteName){
        return res.redirect('/')
      }
      return res.render('backend/admin/setting/index')
    },
    indexAdmin: (req, res) => {
      return res.render('backend/admin/setting/admin')
    },
    save: (req, res) => {
      //grab form data and run validation
      validateForm.validateSetting({
        fields: {
          siteName: {val: req.body.siteName, message: 'Please enter site name.'},
          siteOwner: {val: req.body.siteOwner, message: 'Please enter site owners name.'},
          siteDescription: {val: req.body.siteDescription, message: 'Please input description of site.'},
          siteMail: {val: req.body.siteMail, message: 'Enter e-mail address.'},
          facebookUri: {val: req.body.facebookUri, message: 'Please fill in this field.'},
          twitterUri: {val: req.body.twitterUri, message: 'Please fill in this field.'},
          googleUri: {val: req.body.googleUri, message: 'Please fill in this field.'},
          bitcoinAddress: {val: req.body.bitcoinAddress, message: 'Please enter bitcoin Address.'}
        }
      }, err => {
        if(err) return res.status(422).json({success: false, response: err})

        const settings = {
          siteName: req.body.siteName.trim(),
          siteOwner: req.body.siteOwner.trim(),
          siteDescription: req.body.siteDescription.trim(),
          siteMail: req.body.siteMail.trim(),
          facebookUri: req.body.facebookUri.trim(),
          twitterUri: req.body.twitterUri.trim(),
          googleUri: req.body.googleUri.trim(),
          bitcoinAddress: req.body.bitcoinAddress.trim()
        };

        SettingStore.save(settings).then(result => {
          return res.status(200).json({success: true, response:'Setting Saved!', payload: result})
        }).catch(e => {
          console.log('ERROR:', e)
        })
      })
    },
    saveQr: (req, res) => {
      if(!req.files.qrCode) return res.status(422).json({success: false, response: 'Please upload QR Code.'})

        let qrCode = req.files.qrCode;

        const ext = qrCode.mimetype.split('/')[1];
        const newImageName = 'QRCode' + '-' + Date.now() + '.'+ext;

        qrCode.mv('public/src/uploads/images/qr/'+newImageName, function(err) {
          if (err)
            return res.status(422).json({success: false, response: err.Error})
        })

        const settings = {
          qrCode: '/uploads/images/qr/'+newImageName
        };

        SettingStore.saveQr(settings).then(result => {
          return res.status(200).json({success: true, response: 'QR Code Saved!'})
        }).catch(e => {
          console.log('ERROR:', e)
        })
    }

  }
};
