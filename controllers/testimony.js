const { Testimony } = require('../db/models')

module.exports = {
  index: (req, res) => {
    res.send("HY")
  },
  list: (req, res) => {
    Testimony.all().then(testimony => {
      res.json(testimony)
    })
  },
  create: (req, res) => {
    validateForm.validateSignup({
      fields: {
        message: {val: req.body.message, message: 'Please enter testimony.'}
      }
    }, (err) => {
      if (err) return res.status(422).json({success: false, response: err})

      return models.Testimony.create({
        message: req.body.message.trim(),
        user: req.session.user
      }).then(testimony => {
        res.status(200).json({success: true, response: 'Testimony Sent.', payload: testimony})
      })
    })
  },
  destroy: (req, res) => {
    Testimony.findById(req.body.id).then(testimony => {
      if(!testimony) return res.status(422).json({
        success: false, response: 'Request could not be validated.'
      })

      Testimony.destroy({where: { id: req.body.id }}).then(testimony => {
        Testimony.all().then(testimony => {
          res.status(200).json({success: true, response: 'Testimony Deleted.', payload: testimony})
        })
        
      })
    })
  },
  approve: (req, res) => {
    Testimony.update({isApproved: true}, {where: {id: req.body.id}}).then(testimony => {
      if(!testimony) return res.status(422).json({success: false, response: 'Could complete request.'})

      
    })
  }
};
