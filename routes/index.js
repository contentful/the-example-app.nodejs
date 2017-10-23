const express = require('express')
const { getLandingPage } = require('../services/contentful')
const { catchErrors } = require('../handlers/errorHandlers')
const { getCourses, getCourse, getLesson, getCourseByCategory } = require('./courses')
const { getSettings, postSettings } = require('./settings')
const { getCategories } = require('./categories')
const { getSitemap } = require('./sitemap')
const { getAbout } = require('./about')
const router = express.Router()

/* GET the home landing page. */
router.get('/', catchErrors(async function (req, res, next) {
  const landingPage = await getLandingPage('home', res.locals.currentLocale.code, res.locals.currentApi.id)
  let title = landingPage.fields.title
  if (!title || landingPage.fields.slug === 'home') {
    title = 'The Example App'
  }
  res.render('landingPage', {
    title,
    landingPage
  })
}))

/* Courses Routes */
router.get('/courses', catchErrors(getCourses))
router.get('/courses/categories/:category', catchErrors(getCourseByCategory))
router.get('/courses/:slug', catchErrors(getCourse))
router.get('/courses/:slug/lessons', catchErrors(getCourse))
router.get('/courses/:cslug/lessons/:lslug', catchErrors(getLesson))

/* Settings Routes */
router.get('/settings', catchErrors(getSettings))
router.post('/settings', catchErrors(postSettings))

/* Categories Route */
router.get('/categories', catchErrors(getCategories))

/* Sitemap Route */
router.get('/sitemap', catchErrors(getSitemap))

/* About Route */
router.get('/about', catchErrors(getAbout))

module.exports = router
