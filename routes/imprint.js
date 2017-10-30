/**
 * Renders imprint page when `/imprint` is route is requested
 * @param req - Object - Express request
 * @param res - Object - Express response
 * @param next - Function - Express callback
 * @returns {undefined}
 */
module.exports.getImprint = (req, res, next) => {
  res.render('imprint', { title: 'Imprint' })
}

