const request = require('supertest')

const app = require('../../app')

describe('courses', () => {
  test('it should render a list of courses', () => {
    return request(app).get('/courses')
      .expect(200)
      .then((response) => {
        expect(response.text.match(/<h1>All courses /)).toBeTruthy()
      })
  })
  test('it should render a course', () => {
    return request(app).get('/courses/hello-contentful')
      .expect(200)
      .then((response) => {
        expect(response.text.match(/class="course__title"/)).toBeTruthy()
      })
  })
  test('it should return 404 when a course does not exist', () => {
    return request(app).get('/courses/dont-exist').expect(404)
  })

  test('it should render a lesson', () => {
    return request(app).get('/courses/hello-contentful/lessons/content-management')
      .expect(200)
      .then((response) => {
        expect(response.text.match(/class="lesson__title"/)).toBeTruthy()
      })
  })
})
