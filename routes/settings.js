const express = require('express')
const router = express.Router()

/* GET seeting page. */
router.get('/', function (req, res, next) {
  res.render('settings', { title: 'Settings' })
})

module.exports = router
