const { createClient } = require('contentful')
const { initClient, getSpace } = require('./../services/contentful')

async function renderSettings (res, opts) {
  // Get connectred space to display the space name on top of the settings
  let space = false
  try {
    space = await getSpace()
  } catch (error) {
    console.error(error)
  }

  res.render('settings', {
    title: 'Settings',
    errors: {},
    hasErrors: false,
    success: false,
    space,
    ...opts
  })
}

// GET settings page
module.exports.getSettings = async (req, res, next) => {
  const { settings } = res.locals
  await renderSettings(res, {
    settings
  })
}

// POST settings page
module.exports.postSettings = async (req, res, next) => {
  const errorList = []
  const { spaceId, deliveryToken, previewToken, editorialFeatures } = req.body
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

  // Validate space and CDA access token.
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
        // Already validated via CDA
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
    res.cookie('theExampleAppSettings', settings, { maxAge: 31536000, httpOnly: true })
    res.locals.settings = settings

    // Reinit clients
    initClient(settings)
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

  await renderSettings(res, {
    settings,
    errors,
    hasErrors: errorList.length > 0,
    success: errorList.length === 0
  })
}

