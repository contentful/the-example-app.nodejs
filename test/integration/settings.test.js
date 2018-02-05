const cheerio = require('cheerio')
const cookie = require('cookie')
const cookieParser = require('cookie-parser')
const request = require('supertest')

const app = require('../../app')

function getSettingsCookie (response) {
  try {
    const cookies = response.headers['set-cookie']
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
        expect(status.text()).toMatch(/Connected space:/)

        const inputSpaceId = $('#input-space-id')
        expect(inputSpaceId.val()).toBe(process.env.CONTENTFUL_SPACE_ID)

        const inputCda = $('#input-delivery-token')
        expect(inputCda.val()).toBe(process.env.CONTENTFUL_DELIVERY_TOKEN)

        const inputCpa = $('#input-preview-token')
        expect(inputCpa.val()).toBe(process.env.CONTENTFUL_PREVIEW_TOKEN)

        const inputEditorialFeatures = $('#input-editorial-features')
        expect(inputEditorialFeatures.prop('checked')).toBeFalsy()
      })
  })

  test('should have the editorial features enabled when query parameter is set and set cookie for it', () => {
    return request(app).get('/settings?editorial_features=enabled')
      .expect(200)
      .expect((response) => {
        const cookie = getSettingsCookie(response)
        if (cookie.editorialFeatures === false) {
          throw new Error('Editorial features value in cookie should not be false')
        }

        if (cookie.spaceId !== process.env.CONTENTFUL_SPACE_ID) {
          throw new Error('Did not set correct cookie value for SpaceID')
        }

        if (cookie.deliveryToken !== process.env.CONTENTFUL_DELIVERY_TOKEN) {
          throw new Error('Did not set correct cookie value for CDA access token')
        }

        if (cookie.previewToken !== process.env.CONTENTFUL_PREVIEW_TOKEN) {
          throw new Error('Did not set correct cookie value for CPA access token')
        }
      })
      .then((response) => {
        const $ = cheerio.load(response.text)

        const inputEditorialFeatures = $('#input-editorial-features')
        expect(inputEditorialFeatures.prop('checked')).toBeTruthy()
      })
  })

  test('should have the editorial features disabled when query parameter is set and set cookie for it', () => {
    return request(app).get('/settings?editorial_features=disabled')
      .expect(200)
      .expect((response) => {
        const cookie = getSettingsCookie(response)
        if (cookie.editorialFeatures === true) {
          throw new Error('Editorial features value in cookie should not be true')
        }
      })
      .then((response) => {
        const $ = cheerio.load(response.text)

        const inputEditorialFeatures = $('#input-editorial-features')
        expect(inputEditorialFeatures.prop('checked')).toBeFalsy()
      })
  })
})
