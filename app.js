const path = require('path')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const logger = require('morgan')
const querystring = require('querystring')
const helmet = require('helmet')

// Load environment variables using dotenv
require('dotenv').config({ path: 'variables.env' })

const helpers = require('./helpers')
const { translate, initializeTranslations, setFallbackLocale } = require('./i18n/i18n')
const breadcrumb = require('./lib/breadcrumb')
const { updateCookie } = require('./lib/cookies')
const settings = require('./lib/settings')
const routes = require('./routes/index')
const { getSpace, getLocales } = require('./services/contentful')
const { catchErrors } = require('./handlers/errorHandlers')

const SETTINGS_NAME = 'theExampleAppSettings'

const app = express()

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Force all requests on production to be served over https
app.use(function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    const secureUrl = 'https://' + req.hostname + req.originalUrl
    res.redirect(302, secureUrl)
  }
  next()
})

// Set our application settings based on environment variables or query parameters
app.use(settings)

// Make data available for our views to consume
app.use(catchErrors(async function (request, response, next) {
  response.locals.baseUrl = `${request.protocol}://${request.headers.host}`
  // Get enabled locales from Contentful
  response.locals.locales = [{code: 'en-US', name: 'U.S. English'}]
  response.locals.currentLocale = response.locals.locales[0]
  // Inject custom helpers
  response.locals.helpers = helpers

  // Make query string available in templates to render links properly
  const cleanQuery = helpers.cleanupQueryParameters(request.query)
  const qs = querystring.stringify(cleanQuery)

  response.locals.queryString = qs ? `?${qs}` : ''
  response.locals.queryStringSettings = response.locals.queryString
  response.locals.query = request.query
  response.locals.currentPath = request.path

  // Initialize translations and include them on templates
  initializeTranslations()
  response.locals.translate = translate

  // Set active api based on query parameter
  const apis = [
    {
      id: 'cda',
      label: translate('contentDeliveryApiLabel', response.locals.currentLocale.code)
    },
    {
      id: 'cpa',
      label: translate('contentPreviewApiLabel', response.locals.currentLocale.code)
    }
  ]

  // Set currently used api
  response.locals.currentApi = apis
    .find((api) => api.id === (request.query.api || 'cda'))

  // Fall back to delivery api if an invalid API is passed
  if (!response.locals.currentApi) {
    response.locals.currentApi = apis.find((api) => api.id === 'cda')
  }

  next()
}))

// Test space connection and attach space related data for views if possible
app.use(catchErrors(async function (request, response, next) {
  // Catch misconfigured space credentials and display settings page
  try {
    const space = await getSpace()
    const locales = await getLocales()
    // Update credentials in cookie when space connection is successful
    updateCookie(response, SETTINGS_NAME, response.locals.settings)

    // Get available locales from space
    response.locals.locales = locales
    const defaultLocale = response.locals.locales
      .find((locale) => locale.default)

    if (request.query.locale) {
      response.locals.currentLocale = space.locales
        .find((locale) => locale.code === request.query.locale)
    }

    if (!response.locals.currentLocale) {
      response.locals.currentLocale = defaultLocale
    }

    if (response.locals.currentLocale.fallbackCode) {
      setFallbackLocale(response.locals.currentLocale.fallbackCode)
    }

    // Creates a query string which adds the current credentials to links
    // To other implementations of this app in the about modal
    helpers.updateSettingsQuery(request, response, response.locals.settings)
  } catch (error) {
    if ([401, 404].includes(error.response.status)) {
      // If we can't connect to the space, force the settings page to be shown.
      response.locals.forceSettingsRoute = true
    } else {
      throw error
    }
  }
  next()
}))

app.use(breadcrumb())

// Initialize the route handling
// Check ./routes/index.js to get a list of all implemented routes
app.use('/', routes)

// Catch 404 and forward to error handler
app.use(function (request, response, next) {
  const err = new Error(translate('errorMessage404Route', response.locals.currentLocale.code))
  err.status = 404
  next(err)
})

// Error handler
app.use(function (err, request, response, next) {
  // Set locals, only providing error in development
  response.locals.error = err
  response.locals.error.status = err.status || 500
  if (request.app.get('env') !== 'development') {
    delete err.stack
  }
  response.locals.title = 'Error'
  // Render the error page
  response.status(err.status || 500)
  response.render('error')
})

module.exports = app
