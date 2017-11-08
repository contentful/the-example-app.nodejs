/*
 * The purpose of this module is to render the category page when the route is requested
 */

const {
  getCourses,
  getCourse,
  getCategories,
  getCoursesByCategory
} = require('./../services/contentful')

const attachEntryState = require('../lib/entry-state')
const enhanceBreadcrumb = require('../lib/enhance-breadcrumb')
const { updateCookie } = require('../lib/cookies')
const { translate } = require('../i18n/i18n')

/**
 * Renders courses list when `/courses` route is requested
 *
 * @param request - Object - Express request object
 * @param response - Object - Express response object
 * @param next - Function - express callback
 *
 * @returns {undefined}
 */
module.exports.getCourses = async (request, response, next) => {
  // Get all the entries of content type course
  let courses = []
  let categories = []
  courses = await getCourses(response.locals.currentLocale.code, response.locals.currentApi.id)

  // Attach entry state flags when using preview API
  if (response.locals.settings.editorialFeatures && response.locals.currentApi.id === 'cpa') {
    courses = await Promise.all(courses.map(attachEntryState))
  }

  categories = await getCategories(response.locals.currentLocale.code, response.locals.currentApi.id)
  response.render('courses', {
    title: `${translate('allCoursesLabel', response.locals.currentLocale.code)} (${courses.length})`,
    categories,
    courses
  })
}

/**
 * Renders a course when `/courses/:slug` route is requested
 *
 * @param request - Object - Express request object
 * @param response - Object - Express response object
 * @param next - Function - express callback
 *
 * @returns {undefined}
 */
module.exports.getCourse = async (request, response, next) => {
  let course = await getCourse(request.params.slug, response.locals.currentLocale.code, response.locals.currentApi.id)

  // Get lessons
  const lessons = course.fields.lessons
  let {lesson, lessonIndex} = getNextLesson(lessons, request.params.lslug)

  // Manage state of viewed lessons
  const cookie = request.cookies.visitedLessons
  let visitedLessons = cookie || []
  visitedLessons.push(course.sys.id)
  visitedLessons = [...new Set(visitedLessons)]
  updateCookie(response, 'visitedLessons', visitedLessons)

  // Attach entry state flags when using preview API
  if (response.locals.settings.editorialFeatures && response.locals.currentApi.id === 'cpa') {
    course = await attachEntryState(course)
  }

  // Enhance the breadcrumbs with the course
  enhanceBreadcrumb(response, course)

  response.render('course', {title: course.fields.title, course, lesson, lessons, lessonIndex, visitedLessons})
}

/**
 * Renders a courses list by a category when `/courses/category/:category` route is requested
 *
 * @param request - Object - Express request object
 * @param response - Object - Express response object
 * @param next - Function - Express callback
 *
 * @returns {undefined}
 */
module.exports.getCoursesByCategory = async (request, response, next) => {
  // We get all the entries with the content type `course` filtered by a category
  let courses = []
  let categories = []
  let activeCategory = ''
  try {
    categories = await getCategories()
    activeCategory = categories.find((category) => category.fields.slug === request.params.category)
    courses = await getCoursesByCategory(activeCategory.sys.id, response.locals.currentLocale.code, response.locals.currentApi.id)
  } catch (e) {
    console.log('Error ', e)
  }

  // Enhance the breadcrumbs with the active category
  enhanceBreadcrumb(response, activeCategory)

  response.render('courses', { title: `${activeCategory.fields.title} (${courses.length})`, categories, courses })
}

/**
 * Renders a lesson details when `/courses/:courseSlug/lessons/:lessonSlug` route is requested
 *
 * @param request - Object - Express request object
 * @param response - Object - Express response object
 * @param next - Function - express callback
 *
 * @returns {undefined}
 */
module.exports.getLesson = async (request, response, next) => {
  let course = await getCourse(request.params.cslug, response.locals.currentLocale.code, response.locals.currentApi.id)

  const lessons = course.fields.lessons
  let {lesson, nextLesson} = getNextLesson(lessons, request.params.lslug)

  // Save visited lessons
  const cookie = request.cookies.visitedLessons
  let visitedLessons = cookie || []
  visitedLessons.push(lesson.sys.id)
  visitedLessons = [...new Set(visitedLessons)]
  updateCookie(response, 'visitedLessons', visitedLessons)

  // Attach entry state flags when using preview API
  if (response.locals.settings.editorialFeatures && response.locals.currentApi.id === 'cpa') {
    lesson = await attachEntryState(lesson)
  }

  // Enhance the breadcrumbs with the course and active lesson
  enhanceBreadcrumb(response, course)
  enhanceBreadcrumb(response, lesson)

  response.render('course', {
    title: `${course.fields.title} | ${lesson.fields.title}`,
    course,
    lesson,
    lessons,
    nextLesson,
    visitedLessons
  })
}

function getNextLesson (lessons, lslug) {
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === lslug)
  let lesson = lessons[lessonIndex]
  const nextLesson = lessons[lessonIndex + 1] || null

  return {
    lessonIndex,
    lesson,
    nextLesson
  }
}
