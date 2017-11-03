/*
 * The purpose of this module is to render the category page when the route is requested
 */

// Renders categories page when `/categories` route is requested
module.exports.getCategories = async (request, response, next) => {
  response.render('categories', { title: 'Categories' })
}

