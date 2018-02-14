/* global describe, test, beforeAll, afterEach, jest, expect */
const { getCourses, getCourse, getCoursesByCategory, getLesson } = require('../../routes/courses')
const { getSettings } = require('../../routes/settings')
const { mockCourse, mockCategory } = require('./mocks/index')
const { translate, translationAvaliable, initializeTranslations } = require('../../i18n/i18n')

jest.mock('../../services/contentful')
const contentful = require('../../services/contentful')

const request = {
  app: {
    locals: {
      breadcrumb: []
    }
  }
}
const response = {
  locals: {
    settings: {
      space: 'spaceId',
      cda: 'cda',
      cpa: 'cpa',
      editorialFeatures: false
    },
    currentLocale: {
      code: 'en-US'
    },
    currentApi: {
      id: 'cda'
    }
  }
}

beforeAll(() => {
  initializeTranslations()

  contentful.getCourses.mockImplementation(() => [mockCourse])
  contentful.getCourse.mockImplementation(() => mockCourse)

  contentful.getCategories.mockImplementation(() => [mockCategory])

  contentful.getCoursesByCategory.mockImplementation(() => [])
  response.render = jest.fn()
  response.cookie = jest.fn()
  request.cookies = { visitedLessons: [] }
})

afterEach(() => {
  response.render.mockClear()
  response.render.mockReset()
})

describe('Courses', () => {
  test('it should courses list once', async () => {
    await getCourses(request, response)
    expect(response.render.mock.calls[0][0]).toBe('courses')
    expect(response.render.mock.calls[0][1].title).toBe('All courses (1)')
    expect(response.render.mock.calls[0][1].courses.length).toBe(1)
    expect(response.render.mock.calls.length).toBe(1)
  })

  test('it should render single course once', async () => {
    request.params = {slug: 'slug', lslug: 'lessonSlug'}
    await getCourse(request, response)
    expect(response.render.mock.calls[0][0]).toBe('course')
    expect(response.render.mock.calls[0][1].title).toBe(mockCourse.fields.title)
    expect(response.render.mock.calls[0][1].course.sys.id).toBe(mockCourse.sys.id)
    expect(response.render.mock.calls[0][1].lesson.sys.id).toBe(mockCourse.fields.lessons[0].sys.id)
    expect(response.render.mock.calls.length).toBe(1)
  })
  test('it should render list of courses by categories', async () => {
    request.params = {slug: 'slug', lslug: 'lslug', category: 'categorySlug'}
    await getCoursesByCategory(request, response)
    expect(response.render.mock.calls[0][0]).toBe('courses')
    expect(response.render.mock.calls[0][1].title).toBe(`${mockCategory.fields.title} (0)`)
    expect(response.render.mock.calls.length).toBe(1)
  })
})

describe('Lessons', () => {
  test('it should render a lesson', async () => {
    request.params = { cslug: 'courseSlug', lslug: 'lessonSlug' }
    await getLesson(request, response)
    expect(response.render.mock.calls[0][0]).toBe('course')
    expect(response.render.mock.calls[0][1].title).toBe('Course title | Lesson title')
    expect(response.render.mock.calls[0][1].course.sys.id).toBe(mockCourse.sys.id)
    expect(response.render.mock.calls[0][1].lesson.sys.id).toBe(mockCourse.fields.lessons[0].sys.id)
    expect(response.render.mock.calls.length).toBe(1)
  })
})

describe('Settings', () => {
  test('It should render settings', async () => {
    await getSettings(request, response)
    expect(response.render.mock.calls[0][0]).toBe('settings')
    expect(response.render.mock.calls[0][1].title).toBe('Settings')
    expect(response.render.mock.calls[0][1].settings).toBe(response.locals.settings)
  })
})

describe('i18n', () => {
  test('It returns the fallback value when locale file is not found', () => {
    expect(translate('defaultTitle', 'not-existing-locale-file')).toBe('The Example App')
  })

  test('It returns an error when symbol is not found on locale file', () => {
    expect(translate('foo', 'en-US')).toBe('Translation not found for foo')
  })

  test('It returns the translated string when symbol is found on locale file', () => {
    expect(translate('coursesLabel', 'en-US')).toBe('Courses')
  })
  test('It returns true if string is found for locale', () => {
    expect(translationAvaliable('coursesLabel', 'en-US')).toBe(true)
  })
  test('It returns false if locale is not found', () => {
    expect(translationAvaliable('foo-symbol', 'en-US')).toBe(false)
    expect(translationAvaliable('foo-symbol', 'not-existing-locale')).toBe(false)
  })
})
