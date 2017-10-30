/**
 * This module renders landing pages when its route is requested
 * It is used for pages like about and home page
 */
const url = require('url')

const { getLandingPage } = require('../services/contentful')
const attachEntryState = require('./../lib/entry-state')

/**
 * Renders a landing page when `/` or `/about` route is requested
 * based on the pathname an entry is queried from contentful
 * and a view is rendered from the pulled data
 *
 * @param req - Object - Express request
 * @param res - Object - Express response
 * @param next - Function - Express callback
 * @returns {undefined}
 */
module.exports.getLandingPage = async (req, res, next) => {
  let pathname = url.parse(req.url).pathname.split('/').filter(Boolean)[0]
  pathname = pathname || 'home'
  let landingPage = await getLandingPage(
    pathname,
    res.locals.currentLocale.code,
    res.locals.currentApi.id
  )

  // Attach entry state flags when using preview APIs
  if (res.locals.settings.editorialFeatures && res.locals.currentApi.id === 'cpa') {
    landingPage = await attachEntryState(landingPage)
  }

  res.render('landingPage', { title: pathname, landingPage })
}

