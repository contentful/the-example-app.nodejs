/**
 * Renders imprint page when `/imprint` route is requested
 * @param request - Object - Express request
 * @param response - Object - Express response
 * @param next - Function - Express callback
 * @returns {undefined}
 */
module.exports.getImprint = (request, response, next) => {
  response.render('imprint', { title: 'Imprint' })
}

