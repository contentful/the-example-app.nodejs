/**
 * This module renders a layout when its route is requested
 * It is used for pages like home page
 */
const url = require('url')

const { getLandingPage } = require('../services/contentful')
const attachEntryState = require('../lib/entry-state')
const shouldEnableEditorialFeatures = require('../lib/should-enable-editorial-features')

/**
 * Renders a landing page when `/` route is requested
 * based on the pathname an entry is queried from contentful
 * and a view is rendered from the pulled data
 *
 * @param request - Object - Express request
 * @param response - Object - Express response
 * @param next - Function - Express callback
 * @returns {undefined}
 */
module.exports.getLandingPage = async (request, response, next) => {
  let pathname = url.parse(request.url).pathname.split('/').filter(Boolean)[0]
  pathname = pathname || 'home'
  let landingPage = await getLandingPage(
    pathname,
    response.locals.currentLocale.code,
    response.locals.currentApi.id
  )

  // Attach entry state flags when using preview API
  if (shouldEnableEditorialFeatures(response)) {
    landingPage = await attachEntryState(landingPage)
  }

  response.render('landingPage', { title: pathname, landingPage })
}
