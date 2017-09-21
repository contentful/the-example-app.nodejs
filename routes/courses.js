const express = require('express')
const router = express.Router()

/* GET courses listing. */
router.get('/', function (req, res, next) {
  res.render('courses', { title: 'Courses' })
})

/* GET course detail. */
router.get('/:slug', function (req, res, next) {
  res.render('courses', { title: `Course with slug ${req.params.slug}` })
})

/* GET course lesson detail. */
router.get('/:cslug/lessons/:lslug', function (req, res, next) {
  res.render('courses', { title: `Course with slug ${req.params.cslug}` })
})

module.exports = router
