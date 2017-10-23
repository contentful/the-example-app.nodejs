const {getCourses, getCourse, getCategories, getCoursesByCategory} = require('./../services/contentful')

exports.getCourses = async (req, res, next) => {
  // we get all the entries with the content type `course`
  let courses = []
  let categories = []
  courses = await getCourses(res.locals.currentLocale.code, res.locals.currentApi.id)
  categories = await getCategories(res.locals.currentLocale.code, res.locals.currentApi.id)
  res.render('courses', { title: `All Courses (${courses.length})`, categories, courses })
}

exports.getCourse = async (req, res, next) => {
  let course = await getCourse(req.params.slug, res.locals.currentLocale.code, res.locals.currentApi.id)

  // Get lessons
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  const lesson = lessons[lessonIndex]

  // save visited lessons
  const cookie = req.cookies.visitedLessons
  let visitedLessons = cookie || []
  visitedLessons.push(course.sys.id)
  visitedLessons = [...new Set(visitedLessons)]
  res.cookie('visitedLessons', visitedLessons, { maxAge: 900000, httpOnly: true })

  if (res.locals.settings.editorialFeatures) {
    let entryDelivery, entryPreview

    if (res.locals.currentApi.id === 'cda') {
      entryDelivery = course
      try {
        entryPreview = await getCourse(req.params.slug, res.locals.currentLocale.code, 'cpa')
      } catch (err) {
        entryPreview = null
      }
    } else {
      entryPreview = course
      try {
        entryDelivery = await getCourse(req.params.slug, res.locals.currentLocale.code, 'cda')
      } catch (err) {
        entryDelivery = null
      }
    }

    return res.render('course', {
      title: course.fields.title,
      course,
      lesson,
      lessons,
      lessonIndex,
      visitedLessons,
      entryDelivery,
      entryPreview
    })
  }

  res.render('course', {title: course.fields.title, course, lesson, lessons, lessonIndex, visitedLessons})
}

exports.getCoursesByCategory = async (req, res, next) => {
  // we get all the entries with the content type `course` filtered by a category
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

/* GET course lesson detail. */
exports.getLesson = async (req, res, next) => {
  let course = await getCourse(req.params.cslug, res.locals.currentLocale.code, res.locals.currentApi.id)
  const lessons = course.fields.lessons
  const lessonIndex = lessons.findIndex((lesson) => lesson.fields.slug === req.params.lslug)
  const lesson = lessons[lessonIndex]
  const nextLesson = lessons[lessonIndex + 1] || null
  const cookie = req.cookies.visitedLessons
  let visitedLessons = cookie || []
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
}

