const express = require('express')
const router = express.Router()

/* GET sitemap page. */
router.get('/', function (req, res, next) {
  res.render('sitemap', { title: 'Sitemap' })
})

module.exports = router
