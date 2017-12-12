/**
 * This module renders the settings page when `settings` route is requested
 * it also saves the settings to a cookie
 */
const { createClient } = require('contentful')
const { initClients, getSpace } = require('./../services/contentful')
const { updateCookie } = require('../lib/cookies')
const { translate } = require('../i18n/i18n')
const { uniqWith, isEqual } = require('lodash')
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
    title: translate('settingsLabel', response.locals.currentLocale.code),
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
  const currentLocale = response.locals.currentLocale
  let errorList = []
  let { spaceId, deliveryToken, previewToken, editorialFeatures } = request.body

  if (request.query.reset) {
    spaceId = process.env.CONTENTFUL_SPACE_ID
    deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN
    previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN
  }

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
      message: translate('fieldIsRequiredLabel', currentLocale.code)
    })
  }

  if (!deliveryToken) {
    errorList.push({
      field: 'deliveryToken',
      message: translate('fieldIsRequiredLabel', currentLocale.code)
    })
  }

  if (!previewToken) {
    errorList.push({
      field: 'previewToken',
      message: translate('fieldIsRequiredLabel', currentLocale.code)
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
          message: translate('deliveryKeyInvalidLabel', currentLocale.code)
        })
      } else if (err.response.status === 404) {
        errorList.push({
          field: 'spaceId',
          message: translate('spaceOrTokenInvalid', currentLocale.code)
        })
      } else {
        errorList.push({
          field: 'deliveryToken',
          message: `${translate('somethingWentWrongLabel', currentLocale.code)}: ${err.response.data.message}`
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
          message: translate('previewKeyInvalidLabel', currentLocale.code)
        })
      } else if (err.response.status === 404) {
        errorList.push({
          field: 'spaceId',
          message: translate('spaceOrTokenInvalid', currentLocale.code)
        })
      } else {
        errorList.push({
          field: 'previewToken',
          message: `${translate('somethingWentWrongLabel', currentLocale.code)}: ${err.response.data.message}`
        })
      }
    }
  }
  errorList = uniqWith(errorList, isEqual)
  // If no errors, then cache the new settings in the cookie
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
