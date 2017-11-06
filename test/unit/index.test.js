/* global describe, test, beforeAll, afterEach, jest, expect */
const { getCourses, getCourse, getCoursesByCategory, getLesson } = require('../../routes/courses')
const { getSettings } = require('../../routes/settings')
const { mockCourse, mockCategory } = require('./mocks/index')

jest.mock('../../services/contentful')
const contentful = require('../../services/contentful')

const request = {}
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
    expect(response.render.mock.calls[0][1].title).toBe('All Courses (1)')
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
