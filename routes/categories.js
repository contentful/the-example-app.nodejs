/*
 * The purpose of this module is to render the category page when the route is requested
 */

// GET category listing
module.exports.getCategories = async (req, res, next) => {
  res.render('categories', { title: 'Categories' })
}

