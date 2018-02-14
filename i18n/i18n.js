const fs = require('fs')
const path = require('path')

let translations = null
let fallbackLocale = null

/**
 * Initializes translation dictionary with contents from /public/locales
 */
function initializeTranslations () {
  if (translations) {
    return
  }

  // Default fallbock locale is english
  setFallbackLocale('en-US')

  translations = {}

  const localesPath = path.join(__dirname, 'locales')

  try {
    const files = fs.readdirSync(localesPath)
      .filter((filename) => filename.endsWith('.json'))

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
 * Sets the fallback locale
 * @param locale string Locale code
 */
function setFallbackLocale (locale) {
  fallbackLocale = locale
}

/**
 * Translate a static string
 * @param symbol string Identifier for static text
 * @param locale string Locale code
 *
 * @returns string
 */
function translate (symbol, locale = 'en-US') {
  const localeDict = translations[locale]
  let translatedValue

  if (localeDict) {
    translatedValue = localeDict[symbol]
  }

  if (!translatedValue) {
    translatedValue = translations[fallbackLocale][symbol]
  }

  if (!translatedValue) {
    return `Translation not found for ${symbol}`
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
function translationAvaliable (symbol, locale = 'en-US') {
  return !!(translations[locale] || translations[fallbackLocale] || {})[symbol]
}

module.exports.initializeTranslations = initializeTranslations
module.exports.setFallbackLocale = setFallbackLocale
module.exports.translate = translate
module.exports.translationAvaliable = translationAvaliable
