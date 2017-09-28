const express = require('express')
const {getCourses, getCourse, getCategories, getCoursesByCategory} = require('./../services/contentful')

const router = express.Router()

/* GET courses listing. */
router.get('/', async function (req, res, next) {
  // we get all the entries with the content type `course`
  let courses = []
  let categories = []
  try {
    courses = await getCourses()
    categories = await getCategories()
  } catch (e) {
    console.log('Error ', e)
  }
  res.render('courses', { title: 'Courses', categories, courses })
})

/* GET courses listing. */
router.get('/categories/:category', async function (req, res, next) {
  // we get all the entries with the content type `course`
  let courses = []
  let categories = []
  try {
    courses = await getCoursesByCategory(req.params.category)
    categories = await getCategories()
  } catch (e) {
    console.log('Error ', e)
  }
  res.render('courses', { title: 'Courses', categories, courses })
})

/* GET course detail. */
router.get('/:slug', async function (req, res, next) {
  let course = await getCourse(req.params.slug)
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  const lesson = lessons[lessonIndex]
  res.render('course', {title: course.fields.title, course, lesson, lessons, lessonIndex})
})

/* GET course lesson detail. */
router.get('/:cslug/lessons/:lslug', async function (req, res, next) {
  let course = await getCourse(req.params.cslug)
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  const lesson = lessons[lessonIndex]
  res.render('course', {title: `${course.fields.title} | ${lesson.fields.title}`, course, lesson, lessons, lessonIndex})
})

module.exports = router
