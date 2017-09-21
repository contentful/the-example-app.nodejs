const { createClient } = require('contentful')

const client = createClient({space: process.env.CF_SPACE, accessToken: process.env.CF_ACCESS_TOKEN})

export function getCourses () {
  // TODO
}

export function getLessons (courseId) {
  // TODO
}

export function getCategories () {
  // TODO
}

export function getCoursesByCategory (category) {
  // TODO
}

