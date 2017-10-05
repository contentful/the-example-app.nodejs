const { createClient } = require('contentful')

let cdaClient = null
let cpaClient = null

exports.initClient = (options) => {
  const { version } = require('../package.json')
  const config = options || {
    space: process.env.CF_SPACE,
    cda: process.env.CF_ACCESS_TOKEN,
    cpa: process.env.CF_PREVIEW_ACCESS_TOKEN
  }
  cdaClient = createClient({
    application: `contentful.the-example-app.node/${version}`,
    space: config.space,
    accessToken: config.cda
  })
  cpaClient = createClient({
    application: `contentful.the-example-app.node/${version}`,
    space: config.space,
    accessToken: config.cpa,
    host: 'preview.contentful.com'
  })
}

exports.getCourses = assert((locale = 'en-US', api = `cda`) => {
  // to get all the courses we request all the entries
  // with the content_type `course` from Contentful
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({content_type: 'course', locale, include: 10})
    .then((response) => response.items)
}, 'Course')

exports.getLandingPage = (locale = 'en-US', api = `cda`) => {
  // our Home page is fully configureable via Contentful
  const client = api === 'cda' ? cdaClient : cpaClient
  // TODO slug should be renamed to `contentful-the-example-app` or something ....
  return client.getEntries({content_type: 'landingPage', locale, 'fields.slug': 'contentful-university', include: 10})
    .then((response) => response.items[0])
}

exports.getCourse = assert((slug, locale = 'en-US', api = `cda`) => {
  // the SDK supports link resolution only when you call the collection endpoints
  // That's why we are using getEntries with a query instead of getEntry(entryId)
  // make sure to specify the content_type whenever you want to perform a query
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({content_type: 'course', 'fields.slug': slug, locale, include: 10})
    .then((response) => response.items[0])
}, 'Course')

exports.getCategories = assert((locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({content_type: 'category', locale})
    .then((response) => response.items)
}, 'Course')

exports.getCoursesByCategory = assert((category, locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({
    content_type: 'course',
    'fields.categories.sys.id': category,
    locale,
    include: 10
  })
    .then((response) => response.items)
}, 'Category')

function assert (fn, context) {
  return function (req, res, next) {
    return fn(req, res, next)
    .then((data) => {
      if (!data) {
        var err = new Error(`${context} Not Found`)
        err.status = 404
        throw err
      }
      return data
    })
  }
}
