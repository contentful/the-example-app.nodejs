/* GET category listing. */
exports.getCategories = async (req, res, next) => {
  res.render('categories', { title: 'Categories' })
}

