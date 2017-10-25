const app = require('../../app')
const request = require('supertest')
const cheerio = require('cheerio')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')

function getSettingsCookie (res) {
  try {
    const cookies = res.headers['set-cookie']
    const settingsCookie = cookies.find((cookie) => cookie.startsWith('theExampleAppSettings='))
    const parsedCookie = cookie.parse(settingsCookie)
    return cookieParser.JSONCookie(parsedCookie.theExampleAppSettings)
  } catch (err) {
    throw new Error(`Settings cookie was not set or could not be parsed. ${err.message}`)
  }
}

describe('settings', () => {
  test('should render', () => {
    return request(app).get('/settings')
      .expect(200)
      .then((response) => {
        const $ = cheerio.load(response.text)

        const title = $('main h1')
        expect(title.text()).toBe('Settings')

        const status = $('main .status-block.status-block--info')
        expect(status.text()).toMatch(/Connected to space “.+”/)

        const inputSpaceId = $('#input-space')
        expect(inputSpaceId.val()).toBe(process.env.CF_SPACE)

        const inputCda = $('#input-cda')
        expect(inputCda.val()).toBe(process.env.CF_ACCESS_TOKEN)

        const inputCpa = $('#input-cpa')
        expect(inputCpa.val()).toBe(process.env.CF_PREVIEW_ACCESS_TOKEN)

        const inputEditorialFeatures = $('#input-editorial-features')
        expect(inputEditorialFeatures.prop('checked')).toBeFalsy()
      })
  })

  test('should have the editorial features enabled when query parameter is set and set cookie for it', () => {
    return request(app).get('/settings?enable_editorial_features')
      .expect(200)
      .expect((res) => {
        const cookie = getSettingsCookie(res)
        if (!cookie.editorialFeatures) {
          throw new Error('Did not set cookie value for editorial features')
        }

        if (cookie.space !== process.env.CF_SPACE) {
          throw new Error('Did not set correct cookie value for SpaceID')
        }

        if (cookie.cda !== process.env.CF_ACCESS_TOKEN) {
          throw new Error('Did not set correct cookie value for CDA access token')
        }

        if (cookie.cpa !== process.env.CF_PREVIEW_ACCESS_TOKEN) {
          throw new Error('Did not set correct cookie value for CPA access token')
        }
      })
      .then((response) => {
        const $ = cheerio.load(response.text)

        const inputEditorialFeatures = $('#input-editorial-features')
        expect(inputEditorialFeatures.prop('checked')).toBeTruthy()
      })
  })
})
