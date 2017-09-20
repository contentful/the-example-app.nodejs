const express = require('express')
const router = express.Router()

/* GET lessons listing. */
router.get('/', function (req, res, next) {
  res.render('lessons', { title: 'Lessons' })
})

/* GET lessons listing. */
router.get('/:slug', function (req, res, next) {
  res.render('lessons', { title: `Lesson with slug ${req.params.slug}` })
})

module.exports = router
