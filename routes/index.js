const express = require('express')
const { getLandingPage } = require('../services/contentful')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()

/* GET home page. */
router.get('/', catchErrors(async function (req, res, next) {
  const landingPage = await getLandingPage(req.query.locale, req.query.api)
  res.render('index', { title: 'Contentful University', landingPage })
}))

module.exports = router
