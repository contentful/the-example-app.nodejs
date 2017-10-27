require('dotenv').config({ path: 'variables.env' })
const express = require('express')
const querystring = require('querystring')
const path = require('path')
const helpers = require('./helpers')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const routes = require('./routes/index')

const { initClient, getSpace } = require('./services/contentful')
const breadcrumb = require('./lib/breadcrumb')
const app = express()

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
    space: process.env.CF_SPACE,
    cda: process.env.CF_ACCESS_TOKEN,
    cpa: process.env.CF_PREVIEW_ACCESS_TOKEN,
    editorialFeatures: false,
    // Overwrite settings via settings stored to cookie
    ...req.cookies.theExampleAppSettings
  }

  // Allow setting of API credentials via query parameters
  const { space_id, preview_access_token, delivery_access_token } = req.query
  if (space_id && preview_access_token && delivery_access_token) { // eslint-disable-line camelcase
    settings = {
      ...settings,
      space: space_id,
      cda: delivery_access_token,
      cpa: preview_access_token
    }
    res.cookie('theExampleAppSettings', settings, { maxAge: 31536000, httpOnly: true })
  }

  // Allow enabling of editorial features via query parameters
  const { enable_editorial_features } = req.query
  if (enable_editorial_features !== undefined) { // eslint-disable-line camelcase
    delete req.query.enable_editorial_features
    settings.editorialFeatures = true
    res.cookie('theExampleAppSettings', settings, { maxAge: 31536000, httpOnly: true })
  }

  initClient(settings)
  res.locals.settings = settings
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
