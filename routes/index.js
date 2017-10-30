const express = require('express')

const { catchErrors } = require('../handlers/errorHandlers')
const { getCourses, getCourse, getLesson, getCoursesByCategory } = require('./courses')
const { getSettings, postSettings } = require('./settings')
const { getLandingPage } = require('./landingPage')
const { getImprint } = require('./imprint')

const router = express.Router()

// GET the home landing page
router.get('/', catchErrors(getLandingPage))

// Courses Routes
router.get('/courses', catchErrors(getCourses))
router.get('/courses/categories/:category', catchErrors(getCoursesByCategory))
router.get('/courses/:slug', catchErrors(getCourse))
router.get('/courses/:slug/lessons', catchErrors(getCourse))
router.get('/courses/:cslug/lessons/:lslug', catchErrors(getLesson))

// Settings Routes
router.get('/settings', catchErrors(getSettings))
router.post('/settings', catchErrors(postSettings))

// Imprint Route
router.get('/imprint', catchErrors(getImprint))

module.exports = router
