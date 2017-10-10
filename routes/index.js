const express = require('express')
const { getLandingPage } = require('../services/contentful')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()

/* GET the home landing page. */
router.get('/', catchErrors(async function (req, res, next) {
  const landingPage = await getLandingPage('home', res.locals.currentLocale.code, res.locals.currentLocale.id)
  let title = landingPage.fields.title
  if (!title || landingPage.fields.slug === 'home') {
    title = 'The Example App'
  }
  res.render('landingPage', {
    title,
    landingPage
  })
}))

module.exports = router
