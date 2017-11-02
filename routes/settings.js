/**
 * This module renders the settings page when `settings` route is requested
 * it also saves the settings to a cookie
 */
const { createClient } = require('contentful')
const { initClients, getSpace } = require('./../services/contentful')
const { updateCookie } = require('../lib/cookies')

const SETTINGS_NAME = 'theExampleAppSettings'

async function renderSettings (response, opts) {
  // Get connected space to display the space name on top of the settings
  let space = false
  try {
    space = await getSpace()
  } catch (error) {
    // We throw the error here, it will be handled by the error middleware
    // We keep space false to ensure the "Connected to" box is not shown.
    throw (error)
  }

  response.render('settings', {
    title: 'Settings',
    errors: {},
    hasErrors: false,
    success: false,
    space,
    ...opts
  })
}

/**
 * Renders the settings page when `/settings` route is requested
 *
 * @param request - Object - Express request
 * @param response - Object - Express response
 * @param next - Function - Express callback
 *
 * @returns {undefined}
 */
module.exports.getSettings = async (request, response, next) => {
  const { settings } = response.locals
  await renderSettings(response, {
    settings
  })
}

/**
 * Save settings when POST request is triggered to the `/settings` route
 * and render the settings page
 *
 * @param request - Object - Express request
 * @param response - Object - Express response
 * @param next - Function - Express callback
 *
 * @returns {undefined}
 */
module.exports.postSettings = async (request, response, next) => {
  const errorList = []
  const { spaceId, deliveryToken, previewToken, editorialFeatures } = request.body
  const settings = {
    spaceId,
    deliveryToken,
    previewToken,
    editorialFeatures: !!editorialFeatures
  }

  // Validate required fields.
  if (!spaceId) {
    errorList.push({
      field: 'spaceId',
      message: 'This field is required'
    })
  }

  if (!deliveryToken) {
    errorList.push({
      field: 'deliveryToken',
      message: 'This field is required'
    })
  }

  if (!previewToken) {
    errorList.push({
      field: 'previewToken',
      message: 'This field is required'
    })
  }

  // Validate space and delivery access token.
  if (spaceId && deliveryToken) {
    try {
      await createClient({
        space: spaceId,
        accessToken: deliveryToken
      }).getSpace()
    } catch (err) {
      if (err.response.status === 401) {
        errorList.push({
          field: 'deliveryToken',
          message: 'Your Delivery API key is invalid.'
        })
      } else if (err.response.status === 404) {
        errorList.push({
          field: 'spaceId',
          message: 'This space does not exist or your access token is not associated with your space.'
        })
      } else {
        errorList.push({
          field: 'deliveryToken',
          message: `Something went wrong: ${err.response.data.message}`
        })
      }
    }
  }

  // Validate space and CPA access token.
  if (spaceId && previewToken) {
    try {
      await createClient({
        space: spaceId,
        accessToken: previewToken,
        host: 'preview.contentful.com'
      }).getSpace()
    } catch (err) {
      if (err.response.status === 401) {
        errorList.push({
          field: 'previewToken',
          message: 'Your Preview API key is invalid.'
        })
      } else if (err.response.status === 404) {
        errorList.push({
          field: 'spaceId',
          message: 'This space does not exist or your delivery token is not associated with your space.'
        })
      } else {
        errorList.push({
          field: 'previewToken',
          message: `Something went wrong: ${err.response.data.message}`
        })
      }
    }
  }

  // When no errors occurred
  if (!errorList.length) {
    // Store new settings
    updateCookie(response, SETTINGS_NAME, settings)
    response.locals.settings = settings

    // Reinit clients
    initClients(settings)
  }

  // Generate error dictionary
  // Format: { FIELD_NAME: [array, of, error, messages] }
  const errors = errorList.reduce((errors, error) => {
    return {
      ...errors,
      [error.field]: [
        ...(errors[error.field] || []),
        error.message
      ]
    }
  }, {})

  await renderSettings(response, {
    settings,
    errors,
    hasErrors: errorList.length > 0,
    success: errorList.length === 0
  })
}

