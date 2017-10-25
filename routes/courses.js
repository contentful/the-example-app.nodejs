const {getCourses, getCourse, getCategories, getCoursesByCategory} = require('./../services/contentful')
const attachEntryState = require('./../lib/entry-state')

module.exports.getCourses = async (req, res, next) => {
  // We get all the entries with the content type `course`
  let courses = []
  let categories = []
  courses = await getCourses(res.locals.currentLocale.code, res.locals.currentApi.id)

  // Attach entry state flags when using preview API
  if (res.locals.settings.editorialFeatures && res.locals.currentApi.id === 'cpa') {
    courses = await Promise.all(courses.map(attachEntryState))
  }

  categories = await getCategories(res.locals.currentLocale.code, res.locals.currentApi.id)
  res.render('courses', { title: `All Courses (${courses.length})`, categories, courses })
}

module.exports.getCourse = async (req, res, next) => {
  let course = await getCourse(req.params.slug, res.locals.currentLocale.code, res.locals.currentApi.id)

  // Get lessons
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  const lesson = lessons[lessonIndex]

  // Save visited lessons
  const cookie = req.cookies.visitedLessons
  let visitedLessons = cookie || []
  visitedLessons.push(course.sys.id)
  visitedLessons = [...new Set(visitedLessons)]
  res.cookie('visitedLessons', visitedLessons, { maxAge: 900000, httpOnly: true })

  // Attach entry state flags when using preview API
  if (res.locals.settings.editorialFeatures && res.locals.currentApi.id === 'cpa') {
    course = await attachEntryState(course)
  }

  res.render('course', {title: course.fields.title, course, lesson, lessons, lessonIndex, visitedLessons})
}

module.exports.getCoursesByCategory = async (req, res, next) => {
  // We get all the entries with the content type `course` filtered by a category
  let courses = []
  let categories = []
  let activeCategory = ''
  try {
    categories = await getCategories()
    activeCategory = categories.find((category) => category.fields.slug === req.params.category)
    courses = await getCoursesByCategory(activeCategory.sys.id, res.locals.currentLocale.code, res.locals.currentApi.id)
  } catch (e) {
    console.log('Error ', e)
  }
  res.render('courses', { title: `${activeCategory.fields.title} (${courses.length})`, categories, courses })
}

// GET course lesson detail
module.exports.getLesson = async (req, res, next) => {
  let course = await getCourse(req.params.cslug, res.locals.currentLocale.code, res.locals.currentApi.id)
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  let lesson = lessons[lessonIndex]
  const nextLesson = lessons[lessonIndex + 1] || null

  // Save visited lessons
  const cookie = req.cookies.visitedLessons
  let visitedLessons = cookie || []
  visitedLessons.push(lesson.sys.id)
  visitedLessons = [...new Set(visitedLessons)]
  res.cookie('visitedLessons', visitedLessons, { maxAge: 900000, httpOnly: true })

  // Attach entry state flags when using preview API
  if (res.locals.settings.editorialFeatures && res.locals.currentApi.id === 'cpa') {
    lesson = await attachEntryState(lesson)
  }

  res.render('course', {
    title: `${course.fields.title} | ${lesson.fields.title}`,
    course,
    lesson,
    lessons,
    nextLesson,
    visitedLessons
  })
}

