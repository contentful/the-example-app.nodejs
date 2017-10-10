const express = require('express')
const { getLandingPage } = require('../services/contentful')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()

/* GET the about landing page. */
router.get('/', catchErrors(async function (req, res, next) {
  const landingPage = await getLandingPage('about', res.locals.currentLocale.code, res.locals.currentLocale.id)
  res.render('landingPage', { title: 'About', landingPage })
}))

module.exports = router
