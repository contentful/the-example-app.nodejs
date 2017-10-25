/* global describe, test, beforeAll, afterEach, jest, expect */
const { getCourses, getCourse, getCoursesByCategory, getLesson } = require('../../routes/courses')

jest.mock('../../services/contentful')
const contentful = require('../../services/contentful')

const req = {}
const res = {
  locals: {
    currentLocale: {
      code: 'en-US'
    },
    currentApi: {
      id: 'cda'
    }
  }
}

beforeAll(() => {
  contentful.getCourses.mockImplementation(() => [])
  contentful.getCourse.mockImplementation(() => ({
    sys: { id: 'id' },
    fields: {
      lessons: [
        { sys: {id: 'lessonId'}, fields: { slug: 'lessonSlug' } }
      ]
    }
  }))

  contentful.getCategories.mockImplementation(() => [
    {
      sys: { id: 'categoryId' },
      fields: { slug: 'categorySlug', title: 'categoryTitle' }
    }
  ])

  contentful.getCoursesByCategory.mockImplementation(() => [])
  res.render = jest.fn()
  res.cookie = jest.fn()
  req.cookies = { visitedLessons: [] }
})

afterEach(() => {
  res.render.mockClear()
  res.render.mockReset()
})

describe('Courses', () => {
  test('it should courses list once', async () => {
    await getCourses(req, res)
    expect(res.render.mock.calls[0][0]).toBe('courses')
    expect(res.render.mock.calls.length).toBe(1)
  })

  test('it should render single course once', async () => {
    req.params = {slug: 'slug', lslug: 'lslug'}
    await getCourse(req, res)
    expect(res.render.mock.calls[0][0]).toBe('course')
    expect(res.render.mock.calls.length).toBe(1)
  })
  test('it should render list of courses by categories', async () => {
    req.params = {slug: 'slug', lslug: 'lslug', category: 'categorySlug'}
    await getCoursesByCategory(req, res)
    expect(res.render.mock.calls[0][0]).toBe('courses')
    expect(res.render.mock.calls.length).toBe(1)
  })
})

describe('Lessons', () => {
  test('it should render a lesson', async () => {
    req.params = { cslug: 'courseSlug', lslug: 'lessonSlug' }
    await getLesson(req, res)
    expect(res.render.mock.calls[0][0]).toBe('course')
    expect(res.render.mock.calls.length).toBe(1)
  })
})
