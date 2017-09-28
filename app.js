require('dotenv').config({ path: 'variables.env' })
const express = require('express')
const url = require('url')
const path = require('path')
const helpers = require('./helpers')
// const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const index = require('./routes/index')
const courses = require('./routes/courses')
const categories = require('./routes/categories')
const about = require('./routes/about')
const settings = require('./routes/settings')
const sitemap = require('./routes/sitemap')
const {initClient} = require('./services/contentful')
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Pass custo helpers to all our templates
app.use(function (req, res, next) {
  res.locals.helpers = helpers
  const qs = url.parse(req.url).query
  res.locals.queryString = qs ? `?${qs}` : ''
  res.locals.query = req.query
  res.locals.currentPath = req.path
  console.log(req.path)
  next()
})

app.use('/', index)
app.use('/courses', courses)
app.use('/categories', categories)
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
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

// app.use()
// init the contentful client
initClient()

module.exports = app
