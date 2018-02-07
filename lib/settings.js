/**
 * The purpose of this middleware is to set our application settings based
 * on environment variables or query parameters
 */

const { initClients } = require('../services/contentful')

module.exports = async function settingsMiddleware (request, response, next) {
  // Set default settings based on environment variables
  let settings = {
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    deliveryToken: process.env.CONTENTFUL_DELIVERY_TOKEN,
    previewToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
    editorialFeatures: false,
    // Overwrite default settings using those stored in cookie, if present
    ...request.cookies.theExampleAppSettings
  }

  // Allow setting of API credentials via query parameters
  const { space_id, preview_token, delivery_token } = request.query
  if (space_id && preview_token && delivery_token) { // eslint-disable-line camelcase
    settings = {
      ...settings,
      spaceId: space_id,
      deliveryToken: delivery_token,
      previewToken: preview_token
    }
  }

  // Allow enabling and disabling of editorial features via query parameters
  /* eslint-disable camelcase */
  const { editorial_features } = request.query
  if (typeof editorial_features !== 'undefined') {
    delete request.query.editorial_features
    settings.editorialFeatures = editorial_features === 'enabled'
  }
  /* eslint-enable camelcase */

  initClients(settings)
  response.locals.settings = settings
  next()
}
