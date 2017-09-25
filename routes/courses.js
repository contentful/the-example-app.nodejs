const express = require('express')
const {getCourses} = require('./../services/contentful')

const router = express.Router()

/* GET courses listing. */
router.get('/', async function (req, res, next) {
  // we get all the entries with the content type `course`
  let courses = []
  try {
    courses = await getCourses()
  } catch (e) {
    console.log('Error ', e)
  }
  res.render('courses', { title: 'Courses', courses: courses.items })
})

/* GET course detail. */
router.get('/:slug', function (req, res, next) {
  res.render('courses', { title: `Course with slug ${req.params.slug}` })
})

/* GET course lesson detail. */
router.get('/:cslug/lessons/:lslug', function (req, res, next) {
  res.render('courses', { title: `Course with slug ${req.params.cslug}` })
})

module.exports = router
