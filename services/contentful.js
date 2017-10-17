const { createClient } = require('contentful')

let cdaClient = null
let cpaClient = null

// Initialize our client
exports.initClient = (options) => {
  // Getting the version the app version
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

exports.getSpace = assert((api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getSpace()
}, 'Space')

// to get all the courses we request all the entries
// with the content_type `course` from Contentful
exports.getCourses = assert((locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({
    content_type: 'course',
    locale,
    order: 'sys.createdAt',
    include: 10
  })
    .then((response) => response.items)
}, 'Course')

// Landing pages like the home or about page are fully controlable via Contentful.
exports.getLandingPage = (slug, locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({
    content_type: 'layout',
    locale,
    'fields.slug': slug,
    include: 10
  })
    .then((response) => {
      console.log(response.items[0])
      return response.items[0]
    })
}

// the SDK supports link resolution only when you call the collection endpoints
// That's why we are using getEntries with a query instead of getEntry(entryId)
// make sure to specify the content_type whenever you want to perform a query
exports.getCourse = assert((slug, locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({
    content_type: 'course',
    'fields.slug': slug,
    locale,
    include: 10
  })
    .then((response) => response.items[0])
}, 'Course')

exports.getCategories = assert((locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({content_type: 'category', locale})
    .then((response) => response.items)
}, 'Course')

// Getting a course by Category is simply querying all entries
// with a query params `fields.categories.sys.id` equal to the desired category id
// Note that you need to send the `content_type` param to be able to query the entry
exports.getCoursesByCategory = assert((category, locale = 'en-US', api = `cda`) => {
  const client = api === 'cda' ? cdaClient : cpaClient
  return client.getEntries({
    content_type: 'course',
    'fields.categories.sys.id': category,
    locale,
    order: '-sys.createdAt',
    include: 10
  })
    .then((response) => response.items)
}, 'Category')

// Utitlities functions
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
