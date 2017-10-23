const { getLandingPage } = require('../services/contentful')

exports.getAbout = async (req, res, next) => {
  const landingPage = await getLandingPage('about',
    res.locals.currentLocale.code,
    res.locals.currentApi.id
  )
  res.render('landingPage', { title: 'About', landingPage })
}

