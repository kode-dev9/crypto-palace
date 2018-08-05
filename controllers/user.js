const {User} = require('../db/models')

module.exports = {
  index: (req, res) => {
    res.send('Hello')
  },
  list: (req, res) => {
    let q = req.query.q
    let sort = req.query.sort

    User.all().then(users => {
      res.json(users)
    })
  },
  show: (req, res) => {
    User.findById(req.params.id).then(user => {
      if(!user) return res.status(422).json({success: false, response: 'User not found!'})

      res.status(200).json({success: true, payload: user})
    })
  },
  ban: (req, res) => {
    User.findById(req.body.id).then(user => {
      if(!user) return res.status(422).json({success: false, response: 'Request could not be completed.'})

      if(user.isBanned) return res.status(422).json({success: false, response: 'User account already locked.'})

      User.update({isBanned: 1}, {where: {id: user.id}}).then(user => {
        if(!user) return res.status(422).json({success: false, response: 'Request could not be completed.'})

        let userBanMail = async () => {
          try {
            await sendEmail('confiyobo@gmail.com',
              'CryptPalace - Account Issue',
              'accountBan',
              {userName: user.name});

            console.log('MAIL GREETING')
          }catch (e) {
            console.log('Mail Error', e)
          }
        };

        userBanMail()

        return res.status(200).json({success: true, response: 'User account locked!'})
      })
    })
  },
  unban: (req, res) => {
    User.findById(req.body.id).then(user => {
      if(!user) return res.status(422).json({success: false, response: 'Request not validated.'})

      if(!user.isBanned) return res.status(422).json({success: false, response: 'User account was never locked.'})

      User.update({isBanned: 0}, {where: {id: user.id}}).then(user => {
        if(!user) return res.status(422).json({success: false, response: 'Request could not be completed.'})

        let userUnBanMail = async () => {
          try {
            await sendEmail('confiyobo@gmail.com',
              'CryptPalace - Account Issue',
              'accountUnBan',
              {userName: user.name});

            console.log('MAIL GREETING')
          }catch (e) {
            console.log('Mail Error', e)
          }
        };

        userUnBanMail()

        return res.status(200).json({success: true, response: 'User account opened!'})
      })
    })
  },
  destroy: (req, res) => {
    User.findById(req.body.id).then(user => {
      if(!user) return res.status(422).json({success: false, response: 'Request not valid.'})

      if(user.isDeleted) return res.status(422).json({success: false, response: 'User has been deleted.'})

      User.update({isDeleted: 1}, {where: {id: user.id}}).then(user => {
        if(!user) return res.status(422).json({success: false, response: 'Request could not be completed.'})

        let userDeleteMail = async () => {
          try {
            await sendEmail('confiyobo@gmail.com',
              'CryptPalace - Account Issue',
              'accountDeleted',
              {userName: user.name});

            console.log('MAIL GREETING')
          }catch (e) {
            console.log('Mail Error', e)
          }
        };

        userDeleteMail()

        return res.status(200).json({success: true, response: 'User deleted!'})
      })
    })
  },

};

