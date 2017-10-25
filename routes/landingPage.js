const { getLandingPage } = require('../services/contentful')
const attachEntryState = require('./../lib/entry-state')
const url = require('url')

module.exports.getLandingPage = async (req, res, next) => {
  let pathname = url.parse(req.url).pathname.split('/').filter(Boolean)[0]
  pathname = pathname || 'home'
  let landingPage = await getLandingPage(
    pathname,
    res.locals.currentLocale.code,
    res.locals.currentApi.id
  )

  // Attach entry state flags when using preview APIgs
  if (res.locals.settings.editorialFeatures && res.locals.currentApi.id === 'cpa') {
    landingPage = await attachEntryState(landingPage)
  }

  res.render('landingPage', { title: pathname, landingPage })
}

