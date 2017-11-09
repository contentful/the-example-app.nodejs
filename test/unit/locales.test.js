const germanLocales = require('../../i18n/locales/de-DE.json')
const englishLocales = require('../../i18n/locales/en-US.json')

describe('locales', () => {
  test('all labels coexist in all locale files', async () => {
    const germanKeys = Object.keys(germanLocales)
    const englishKeys = Object.keys(englishLocales)

    expect(germanKeys).toEqual(englishKeys)
  })
})
