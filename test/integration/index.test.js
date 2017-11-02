const request = require('supertest')

const app = require('../../app')

describe('Home page', () => {
  test('it should render the landing page', () => {
    return request(app).get('/').expect(200)
  })
})
