const express = require('express')
const {getCourses, getCourse} = require('./../services/contentful')

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
router.get('/:slug', async function (req, res, next) {
  let course = {}
  course = await getCourse(req.params.slug)
  res.render('course', {course})
})

/* GET course lesson detail. */
router.get('/:cslug/lessons/:lslug', async function (req, res, next) {
  let course = await getCourse(req.params.cslug)
  let lesson = course.fields.lessons.find((lesson) => lesson.fields.slug === req.params.lslug)
  console.log(lesson)
  res.render('course', {course, lesson})
})

module.exports = router
