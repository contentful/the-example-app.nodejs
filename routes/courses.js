const express = require('express')
const {getCourses, getCourse, getCategories, getCoursesByCategory} = require('./../services/contentful')
const { catchErrors } = require('../handlers/errorHandlers')
const router = express.Router()

/* GET courses listing. */
router.get('/', catchErrors(async function (req, res, next) {
  // we get all the entries with the content type `course`
  let courses = []
  let categories = []
  courses = await getCourses(req.query.locale, req.query.api)
  categories = await getCategories(req.query.locale, req.query.api)
  res.render('courses', { title: `All Courses (${courses.length})`, categories, courses })
}))

/* GET courses listing. */
router.get('/categories/:category', catchErrors(async function (req, res, next) {
  // we get all the entries with the content type `course`
  let courses = []
  let categories = []
  let activeCategory = ''
  courses = await getCoursesByCategory(req.params.category, req.query.locale, req.query.api)
  categories = await getCategories()
  activeCategory = categories.find((category) => category.sys.id === req.params.category)
  res.render('courses', { title: `${activeCategory.fields.title} (${courses.length})`, categories, courses })
}))

/* GET course detail. */
router.get('/:slug', catchErrors(async function (req, res, next) {
  let course = await getCourse(req.params.slug, req.query.locale, req.query.api)
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  const lesson = lessons[lessonIndex]
  const cookie = req.cookies.visitedLessons
  let visitedLessons = cookie ||  []
  visitedLessons.push(course.sys.id)
  visitedLessons = [...new Set(visitedLessons)]
  res.cookie('visitedLessons', visitedLessons, { maxAge: 900000, httpOnly: true })
  res.render('course', {title: course.fields.title, course, lesson, lessons, lessonIndex, visitedLessons})
}))


/* GET course lesson detail. */
router.get('/:cslug/lessons/:lslug', catchErrors(async function (req, res, next) {
  let course = await getCourse(req.params.cslug, req.query.locale, req.query.api)
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  const lesson = lessons[lessonIndex]
  const nextLesson = lessons[lessonIndex + 1] || null
  const cookie = req.cookies.visitedLessons
  let visitedLessons = cookie ||  []
  visitedLessons.push(lesson.sys.id)
  visitedLessons = [...new Set(visitedLessons)]
  res.cookie('visitedLessons', visitedLessons, { maxAge: 900000, httpOnly: true })
  res.render('course', {
    title: `${course.fields.title} | ${lesson.fields.title}`,
    course,
    lesson,
    lessons,
    nextLesson,
    visitedLessons
  })
}))

module.exports = router
