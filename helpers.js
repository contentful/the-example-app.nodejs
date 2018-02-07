const marked = require('marked')
const querystring = require('querystring')

const { translate } = require('./i18n/i18n')

// Parse markdown text
module.exports.markdown = (content = '') => {
  if (!content.trim()) {
    return ''
  }
  return marked(removeInvalidDataURL(content), {sanitize: true})
}

// A handy debugging function we can use to sort of "console.log" our data
module.exports.dump = (obj) => JSON.stringify(obj, null, 2)

module.exports.formatMetaTitle = (title, localeCode = 'en-US') => {
  if (!title) {
    return translate('defaultTitle', localeCode)
  }
  return `${title.charAt(0).toUpperCase()}${title.slice(1)} — ${translate('defaultTitle', localeCode)}`
}

function isCustomCredentials (settings) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID
  const deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN
  const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN

  return settings.spaceId !== spaceId ||
    settings.deliveryToken !== deliveryToken ||
    settings.previewToken !== previewToken
}

function cleanupQueryParameters (query) {
  const cleanQuery = Object.assign({}, query)
  delete cleanQuery.space_id
  delete cleanQuery.delivery_token
  delete cleanQuery.preview_token
  delete cleanQuery.reset
  return cleanQuery
}

function updateSettingsQuery (request, response, settings) {
  const cleanQuery = cleanupQueryParameters(request.query)

  let settingsQuery = Object.assign({}, cleanQuery, {
    editorial_features: settings.editorialFeatures ? 'enabled' : 'disabled'
  })

  if (isCustomCredentials(settings)) {
    settingsQuery = Object.assign(settingsQuery, {
      space_id: settings.spaceId,
      delivery_token: settings.deliveryToken,
      preview_token: settings.previewToken
    })
  }

  const settingsQs = querystring.stringify(settingsQuery)
  response.locals.queryStringSettings = settingsQs ? `?${settingsQs}` : ''
}

module.exports.isCustomCredentials = isCustomCredentials
module.exports.cleanupQueryParameters = cleanupQueryParameters
module.exports.updateSettingsQuery = updateSettingsQuery

/**
 * Evil users might try to add base64 url data to execute js code
 * so we should purge any potentially harmful data to mitigate risk
 */
function removeInvalidDataURL (content) {
  let regex = /data:\S+;base64\S*/gm
  return content.replace(regex, '#')
}
