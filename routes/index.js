const express = require('express')
const {getLandingPage} = require('../services/contentful')
const router = express.Router()

/* GET home page. */
router.get('/', async function (req, res, next) {
  const landingPage = await getLandingPage()
  res.render('index', { landingPage })
})

module.exports = router
