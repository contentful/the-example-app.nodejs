const { createClient } = require('contentful')

let client = null

exports.initClient = () => {
  client = createClient({space: process.env.CF_SPACE, accessToken: process.env.CF_ACCESS_TOKEN})
}
exports.getCourses = () => {
  // to get all the courses we simply request from Contentful all the entries
  // with the content_type `course`
  return client.getEntries({content_type: 'course'})
}

exports.getLessons = (courseId) => {
  // TODO
}

exports.getCategories = () => {
  // TODO
}

exports.getCoursesByCategory = (category) => {
  // TODO
}

