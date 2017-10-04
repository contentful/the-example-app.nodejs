const express = require('express')
const { createClient } = require('contentful')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()

/* GET settings page. */
router.get('/', catchErrors(async function (req, res, next) {
  const cookie = req.cookies.theExampleAppSettings
  const settings = cookie || { cpa: '', cda: '', space: '' }
  res.render('settings', {
    title: 'Settings',
    settings,
    errors: {},
    hasErrors: false,
    success: false
  })
}))

/* POST settings page. */
router.post('/', catchErrors(async function (req, res, next) {
  const errorList = []
  const { space, cda, cpa } = req.body
  const settings = {space, cda, cpa}

  // Validate required fields.
  if (!space) {
    errorList.push({
      field: 'space',
      message: 'This field is required'
    })
  }

  if (!cda) {
    errorList.push({
      field: 'cda',
      message: 'This field is required'
    })
  }

  if (!cpa) {
    errorList.push({
      field: 'cpa',
      message: 'This field is required'
    })
  }

  // Validate space and CDA access token.
  if (space && cda) {
    try {
      await createClient({
        space,
        accessToken: cda
      }).getSpace()
    } catch (err) {
      if (err.response.status === 401) {
        errorList.push({
          field: 'cda',
          message: 'Your Delivery API key is invalid.'
        })
      } else if (err.response.status === 404) {
        errorList.push({
          field: 'space',
          message: 'This space does not exist.'
        })
      } else {
        errorList.push({
          field: 'cda',
          message: `Something went wrong: ${err.response.data.message}`
        })
      }
    }
  }

  // Validate space and CPA access token.
  if (space && cpa) {
    try {
      await createClient({
        space,
        accessToken: cpa,
        host: 'preview.contentful.com'
      }).getSpace()
    } catch (err) {
      if (err.response.status === 401) {
        errorList.push({
          field: 'cpa',
          message: 'Your Preview API key is invalid.'
        })
      } else if (err.response.status === 404) {
        // Already validated via CDA
      } else {
        errorList.push({
          field: 'cpa',
          message: `Something went wrong: ${err.response.data.message}`
        })
      }
    }
  }

  if (!errorList.length) {
    res.cookie('theExampleAppSettings', settings, { maxAge: 900000, httpOnly: true })
  }

  // Generate error dictionary
  const errors = errorList.reduce((errors, error) => {
    return {
      ...errors,
      [error.field]: [
        ...(errors[error.field] || []),
        error.message
      ]
    }
  }, {})

  res.render('settings', {
    title: 'Settings',
    settings,
    errors,
    hasErrors: errorList.length > 0,
    success: errorList.length === 0
  })
}))

module.exports = router
