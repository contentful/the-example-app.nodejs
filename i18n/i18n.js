const fs = require('fs')
const path = require('path')

let translations = null
// Initializes translation dictionary with contents from /public/locales
module.exports.initializeTranslations = () => {
  if (translations) {
    return
  }

  translations = {}

  const localesPath = path.join(__dirname, 'locales')

  try {
    const files = fs.readdirSync(localesPath)

    files.forEach((file) => {
      const localeDict = require(path.join(localesPath, file))
      translations[file.replace('.json', '')] = localeDict
    })
  } catch (error) {
    console.error('Error loading localization files:')
    console.error(error)
  }
}

/**
 * Translate a static string
 * @param symbol string Identifier for static text
 * @param locale string Locale code
 *
 * @returns string
 */
module.exports.translate = (symbol, locale = 'en-US') => {
  const localeDict = translations[locale]
  if (!localeDict) {
    return `Localization file for ${locale} is not available`
  }
  const translatedValue = localeDict[symbol]
  if (!translatedValue) {
    return `Translation not found for ${symbol} in ${locale}`
  }

  return translatedValue
}

/**
 * Checks if string is translatable
 * @param symbol string Identifier for static text
 * @param locale string Locale code
 *
 * @returns boolean
 */
module.exports.translationAvaliable = (symbol, locale = 'en-US') => {
  return !!(translations[locale] || {})[symbol]
}
