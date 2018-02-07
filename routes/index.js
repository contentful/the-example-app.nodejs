/**
 * This module connects rendering modules to routes
 */

const express = require('express')
const router = express.Router()

const { catchErrors } = require('../handlers/errorHandlers')

const { getCourses, getCourse, getLesson, getCoursesByCategory } = require('./courses')
const { getSettings, postSettings } = require('./settings')
const { getLandingPage } = require('./landingPage')
const { getImprint } = require('./imprint')

// Display settings in case of invalid credentials
router.all('*', async (request, response, next) => {
  if (response.locals.forceSettingsRoute) {
    await getSettings(request, response, next)
    return
  }
  next()
})

// GET the home landing page
router.get('/', catchErrors(getLandingPage))

// Courses routes
router.get('/courses', catchErrors(getCourses))
router.get('/courses/categories', catchErrors(getCourses))
router.get('/courses/categories/:category', catchErrors(getCoursesByCategory))
router.get('/courses/:slug', catchErrors(getCourse))
router.get('/courses/:slug/lessons', catchErrors(getCourse))
router.get('/courses/:cslug/lessons/:lslug', catchErrors(getLesson))

// Settings routes
router.get('/settings', catchErrors(getSettings))
router.post('/settings', catchErrors(postSettings))

// Imprint route
router.get('/imprint', catchErrors(getImprint))

module.exports = router
