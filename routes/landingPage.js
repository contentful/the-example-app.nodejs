const { getLandingPage } = require('../services/contentful')
const attachEntryState = require('./../lib/entry-state')
const url = require('url')

exports.getLandingPage = async (req, res, next) => {
  let pathname = url.parse(req.url).pathname.split('/').filter(Boolean)[0]
  pathname = pathname || 'home'
  let landingPage = await getLandingPage(
    pathname,
    res.locals.currentLocale.code,
    res.locals.currentApi.id
  )

  // Get the published version of this lesson when using preview API for entry state detection
  // let publishedLandingPage = null
  if (res.locals.settings.editorialFeatures && res.locals.currentApi.id === 'cpa') {
    // publishedLandingPage = await getPublishedEntry(landingPage)
    landingPage = await attachEntryState(landingPage)
  }

  res.render('landingPage', { title: pathname, landingPage })
}

