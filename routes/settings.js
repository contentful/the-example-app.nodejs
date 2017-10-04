const express = require('express')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()

/* GET settings page. */
router.get('/', catchErrors(async function (req, res, next) {
  const cookie = req.cookies.theExampleAppSettings
  const settings = cookie || { cpa: '', cda: '', space: '' }
  res.render('settings', { title: 'Settings', settings })
}))

/* POST settings page. */
router.post('/', catchErrors(async function (req, res, next) {
  const settings = {space: req.body.space, cda: req.body.cda, cpa: req.body.cpa}
  res.cookie('theExampleAppSettings', settings, { maxAge: 900000, httpOnly: true })
  res.render('settings', settings)
}))

module.exports = router
