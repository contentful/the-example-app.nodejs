const express = require('express')
const { getLandingPage } = require('../services/contentful')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()

/* GET the about landing page. */
router.get('/', catchErrors(async function (req, res, next) {
  const landingPage = await getLandingPage('about', req.query.locale, req.query.api)
  res.render('landingPage', { title: 'About', landingPage })
}))

module.exports = router
