/**
 * The purpose of this middleware is to set our application settings based
 * on environment variables or query parameters
 */

const { initClients } = require('../services/contentful')
const { updateCookie } = require('./cookies')

const SETTINGS_NAME = 'theExampleAppSettings'

module.exports = async function settings (request, response, next) {
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
    updateCookie(response, SETTINGS_NAME, settings)
  }

  // Allow enabling of editorial features via query parameters
  const { enable_editorial_features } = request.query
  if (enable_editorial_features !== undefined) { // eslint-disable-line camelcase
    delete request.query.enable_editorial_features
    settings.editorialFeatures = true
    updateCookie(response, SETTINGS_NAME, settings)
  }

  // The space id needs to be available in the frontend for our example app
  response.cookie('space_id', settings.spaceId)

  initClients(settings)
  response.locals.settings = settings
  next()
}
