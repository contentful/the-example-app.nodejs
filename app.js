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
const { translate, initializeTranslations } = require('./i18n/i18n')
const breadcrumb = require('./lib/breadcrumb')
const routes = require('./routes/index')
const { initClients, getSpace } = require('./services/contentful')
const { updateCookie } = require('./lib/cookies')

const app = express()

const SETTINGS_NAME = 'theExampleAppSettings'

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(helmet())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Force all requests on production to be served over https
app.use(function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    var secureUrl = 'https://' + req.hostname + req.originalUrl
    res.redirect(302, secureUrl)
  }
  next()
})
// Set our application state based on environment variables or query parameters
app.use(async function (request, response, next) {
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
})

// The space id needs to be available in the frontend for our example app
app.use(async function (request, response, next) {
  response.cookie('space_id', response.locals.settings.spaceId)
  next()
})

// Make data available for our views to consume
app.use(async function (request, response, next) {
  // Set active api based on query parameter
  const apis = [
    {
      id: 'cda',
      label: 'Delivery'
    },
    {
      id: 'cpa',
      label: 'Preview'
    }
  ]

  response.locals.currentApi = apis
    .find((api) => api.id === (request.query.api || 'cda'))

  // Get enabled locales from Contentful
  const space = await getSpace()
  response.locals.locales = space.locales

  const defaultLocale = response.locals.locales
    .find((locale) => locale.default)

  if (request.query.locale) {
    response.locals.currentLocale = space.locales
      .find((locale) => locale.code === request.query.locale)
  }

  if (!response.locals.currentLocale) {
    response.locals.currentLocale = defaultLocale
  }

  // Initialize translations and include them on templates
  initializeTranslations()
  response.locals.translate = translate

  // Inject custom helpers
  response.locals.helpers = helpers

  // Make query string available in templates to render links properly
  const qs = querystring.stringify(request.query)
  response.locals.queryString = qs ? `?${qs}` : ''
  response.locals.query = request.query
  response.locals.currentPath = request.path

  next()
})

app.use(breadcrumb())

// Initialize the route handling
// Check ./routes/index.js to get a list of all implemented routes
app.use('/', routes)

// Catch 404 and forward to error handler
app.use(function (request, response, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Error handler
app.use(function (err, request, response, next) {
  // Set locals, only providing error in development
  response.locals.error = request.app.get('env') === 'development' ? err : {}

  // Render the error page
  response.status(err.status || 500)
  response.render('error')
})

module.exports = app
