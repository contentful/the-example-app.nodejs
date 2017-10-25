const app = require('../../app')
const request = require('supertest')

describe('Home page', () => {
  test('it should render the landing page', () => {
    return request(app).get('/').expect(200)
  })
})
