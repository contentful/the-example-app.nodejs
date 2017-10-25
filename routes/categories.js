// GET category listing
module.exports.getCategories = async (req, res, next) => {
  res.render('categories', { title: 'Categories' })
}

