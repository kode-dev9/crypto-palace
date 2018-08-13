const { Testimony, Notification, User } = require('../db/models'),
  { validateForm } = require('../utils/validation')

module.exports = (io) => {
  return {
    index: (req, res) => {
      res.render('backend/pages/reviews')
    },
    list: (req, res) => {
      if(!res.locals.isAdmin){
        return Testimony.findAll({
          where: {
          user: req.session.user
          }}).then(testimonies => {
            return res.json({count: testimonies.length, testimonies: testimonies})
        })
      }

      let limit = 9;   // number of records per page
      let offset = 0;

      Testimony.findAndCountAll()
        .then((data) => {
          let page = (req.query.page) ? req.query.page : 1;      // page number
          let pages = Math.ceil(data.count / limit);
          offset = limit * (page - 1);

          Testimony.all({
            include: [
              {model: User}
            ],
            limit: limit,
            offset: offset,
            $sort: { id: 1 },
            order: [ ['createdAt', 'DESC'] ]
          }).then(testimonies => {
            res.json({'total': data.count, current: page, 'pages': pages, count: testimonies.length, testimonies: testimonies})
          })

        })
    },
    create: (req, res) => {
      validateForm.validateTestimony({
        fields: {
          message: {val: req.body.message, message: 'Please enter review.'}
        }
      }, (err) => {
        if (err) return res.status(422).json({success: false, response: err})

        return Testimony.create({
          message: req.body.message.trim(),
          user: req.session.user
        }).then(testimony => {
          let msg = 'A user has just made a review, got to <a href="/reviews">reviews</a> and check it out.'
          let briefMsg = msg.substr(0, 45);

          briefMsg = briefMsg.substr(0, Math.min(briefMsg.length, briefMsg.lastIndexOf(" ")))

          Notification.create({
            recipient: res.locals.adminId,
            title: 'New Review',
            message: msg,
            briefMessage: briefMsg
          }).then(notification => {
            io.sockets.emit('newNotification.' + notification.recipient, {
              briefMessage: briefMsg,
              id: notification.id,
              createdAt: notification.createdAt,
              title: notification.title
            })
            res.status(200).json({success: true, response: 'Review Sent.', payload: testimony})
          })
        })
      })
    },
    destroy: (req, res) => {
      Testimony.findById(req.body.id).then(testimony => {
        if(!testimony) return res.status(422).json({
          success: false, response: 'Request could not be validated.', testimony
        });

        Testimony.destroy({where: {id: req.body.id}}).then(testimony => {
          Testimony.findAll({order: [ ['createdAt', 'DESC'] ]}).then(testimony => {
            res.status(200).json({success: true, response: 'Review Deleted.', payload: testimony})
          })

        })
      })
    },
    approve: (req, res) => {
      Testimony.update({isApproved: true}, {where: {id: req.body.id}}).then(testimony => {
        if (!testimony) return res.status(422).json({success: false, response: 'Could complete request.'})

        Testimony.findAll({order: [ ['createdAt', 'DESC'] ]}).then(testimony => {
          res.status(200).json({success: true, response: "Review approved!", payload: testimony})
        })
      })
    }
  }
};
