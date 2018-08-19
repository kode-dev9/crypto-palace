module.exports = (io) => {
  return {
    index: (req, res) => {
      res.render('backend/pages/support')
    }
  }
}
