const { getLandingPage } = require('../services/contentful')
const url = require('url')

exports.getLandingPage = async (req, res, next) => {
  let pathname = url.parse(req.url).pathname.split('/').filter(Boolean)[0]
  pathname = pathname || 'home'
  const landingPage = await getLandingPage(
    pathname,
    res.locals.currentLocale.code,
    res.locals.currentApi.id
  )
  res.render('landingPage', { title: pathname, landingPage })
}

