/* GET sitemap page. */
exports.getSitemap = async (req, res, next) => {
  res.render('sitemap', { title: 'Sitemap' })
}

