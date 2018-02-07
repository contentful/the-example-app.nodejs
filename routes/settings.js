/**
 * This module renders the settings page when `settings` route is requested
 * it also saves the settings to a cookie
 */
const { uniqWith, isEqual } = require('lodash')
const { createClient } = require('contentful')

const { isCustomCredentials, updateSettingsQuery } = require('../helpers')
const { updateCookie } = require('../lib/cookies')
const { translate } = require('../i18n/i18n')
const { initClients, getSpace } = require('../services/contentful')

const SETTINGS_NAME = 'theExampleAppSettings'

async function renderSettings (response, opts) {
  // Get connected space to display the space name on top of the settings
  let space = false
  try {
    space = await getSpace()
  } catch (error) {
    // We handle errors within the settings page.
    // No need to throw here.
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
  const currentLocale = response.locals.currentLocale
  const { settings } = response.locals

  const errorList = await generateErrorList(settings, currentLocale)

  // If no errors detected, update app to use new settings
  if (!errorList.length) {
    applyUpdatedSettings(request, response, settings)
  }

  const errors = generateErrorDictionary(errorList)

  await renderSettings(response, {
    settings,
    errors,
    hasErrors: errorList.length > 0,
    success: isCustomCredentials(settings) && errorList.length === 0
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

  const errorList = await generateErrorList(settings, currentLocale)

  // If no errors detected, update app to use new settings
  if (!errorList.length) {
    applyUpdatedSettings(request, response, settings)
  }

  const errors = generateErrorDictionary(errorList)

  await renderSettings(response, {
    settings,
    errors,
    hasErrors: errorList.length > 0,
    success: errorList.length === 0
  })
}

async function generateErrorList (settings, currentLocale) {
  const { spaceId, deliveryToken, previewToken } = settings
  let errorList = []

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
        accessToken: deliveryToken,
        // Environment variable is used here to enable testing this app internally at Contentful.
        // You can just omit the host since it defaults to 'cdn.contentful.com'
        host: process.env.CONTENTFUL_DELIVERY_API_HOST
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
        // Environment variable is used here to enable testing this app internally at Contentful.
        // You should use 'preview.contentful.com' as host to use the preview api
        host: process.env.CONTENTFUL_PREVIEW_API_HOST
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

  return errorList
}

// Generate error dictionary
// Format: { FIELD_NAME: [array, of, error, messages] }
function generateErrorDictionary (errorList) {
  return errorList.reduce((errors, error) => {
    return {
      ...errors,
      [error.field]: [
        ...(errors[error.field] || []),
        error.message
      ]
    }
  }, {})
}

function applyUpdatedSettings (request, response, settings) {
  // Store new settings
  updateCookie(response, SETTINGS_NAME, settings)
  response.locals.settings = settings

  // Update query settings string
  updateSettingsQuery(request, response, settings)

  // Reinit clients
  initClients(settings)
}
