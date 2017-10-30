const path = require('path')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const logger = require('morgan')
const querystring = require('querystring')

// Load environment variables from the variables.env file.
require('dotenv').config({ path: 'variables.env' })

const helpers = require('./helpers')
const breadcrumb = require('./lib/breadcrumb')
const routes = require('./routes/index')
const { initClient, getSpace } = require('./services/contentful')

const app = express()

const ONE_YEAR = 31536000
const SETTINGS_NAME = 'theExampleAppSettings'

// View engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(breadcrumb())

// Set our application state based on environment variables or query parameters.
app.use(async function (req, res, next) {
  // Set default settings based on environment variables
  let settings = {
    spaceId: process.env.CF_SPACE_ID,
    deliveryToken: process.env.CF_DELIVERY_TOKEN,
    previewToken: process.env.CF_PREVIEW_TOKEN,
    editorialFeatures: false,
    // Overwrite settings via settings stored to cookie
    ...req.cookies.theExampleAppSettings
  }

  // Allow setting of API credentials via query parameters
  const { space_id, preview_token, delivery_token } = req.query
  if (space_id && preview_token && delivery_token) { // eslint-disable-line camelcase
    settings = {
      ...settings,
      spaceId: space_id,
      deliveryToken: delivery_token,
      previewToken: preview_token
    }
    res.cookie(SETTINGS_NAME, settings, { maxAge: ONE_YEAR, httpOnly: true })
  }

  // Allow enabling of editorial features via query parameters
  const { enable_editorial_features } = req.query
  if (enable_editorial_features !== undefined) { // eslint-disable-line camelcase
    delete req.query.enable_editorial_features
    settings.editorialFeatures = true
    res.cookie(SETTINGS_NAME, settings, { maxAge: ONE_YEAR, httpOnly: true })
  }

  initClient(settings)
  res.locals.settings = settings
  next()
})

// Extend template locals with all information needed to render our app properly.
app.use(async function (req, res, next) {
  // Set active api based on query parameter
  const apis = [
    {
      id: 'cda',
      label: 'Delivery (published content)'
    },
    {
      id: 'cpa',
      label: 'Preview (draft content)'
    }
  ]

  res.locals.currentApi = apis
    .find((api) => api.id === (req.query.api || 'cda'))

  // Get enabled locales from Contentful
  const space = await getSpace()
  res.locals.locales = space.locales

  const defaultLocale = res.locals.locales
    .find((locale) => locale.default)

  if (req.query.locale) {
    res.locals.currentLocale = space.locales
      .find((locale) => locale.code === req.query.locale)
  }

  if (!res.locals.currentLocale) {
    res.locals.currentLocale = defaultLocale
  }

  // Inject custom helpers
  res.locals.helpers = helpers

  // Make query string available in templates to render links properly
  const qs = querystring.stringify(req.query)
  res.locals.queryString = qs ? `?${qs}` : ''
  res.locals.query = req.query
  res.locals.currentPath = req.path

  next()
})

// Initialize the route handling
// Check ./routes/index.js to get a list of all implemented routes
app.use('/', routes)

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // Render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
