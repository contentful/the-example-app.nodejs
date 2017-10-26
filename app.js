require('dotenv').config({ path: 'variables.env' })
const express = require('express')
const querystring = require('querystring')
const path = require('path')
const helpers = require('./helpers')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const index = require('./routes/index')
const courses = require('./routes/courses')
const about = require('./routes/about')
const settings = require('./routes/settings')
const sitemap = require('./routes/sitemap')
const { initClient, getSpace } = require('./services/contentful')
const breadcrumb = require('./lib/breadcrumb')
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(breadcrumb())

// Pass our application state and custom helpers to all our templates
app.use(async function (req, res, next) {
  // Allow setting of API credentials via query parameters
  let settings = {
    space: process.env.CF_SPACE,
    cda: process.env.CF_ACCESS_TOKEN,
    cpa: process.env.CF_PREVIEW_ACCESS_TOKEN,
    editorialFeatures: false,
    ...req.cookies.theExampleAppSettings
  }

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
    settings = {
      ...settings,
      editorialFeatures: true
    }
    res.cookie('theExampleAppSettings', settings, { maxAge: 31536000, httpOnly: true })
  }

  initClient(settings)
  res.locals.settings = settings

  // Manage language and API type state and make it globally available
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

  // Make query string available in templates
  const qs = querystring.stringify(req.query)
  res.locals.queryString = qs ? `?${qs}` : ''
  res.locals.query = req.query
  res.locals.currentPath = req.path

  next()
})

app.use('/', index)
app.use('/courses', courses)
app.use('/about', about)
app.use('/settings', settings)
app.use('/sitemap', sitemap)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
