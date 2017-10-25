const app = require('../../app')
const request = require('supertest')

describe('settings', () => {
  test('it should render the settings page', () => {
    return request(app).get('/settings')
      .expect(200)
      .then((response) => {
        expect(response.text.match(/Connected to space “.+”/)).toBeTruthy()
      })
  })
})
