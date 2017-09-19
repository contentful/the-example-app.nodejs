var express = require('express');
var router = express.Router();

/* GET courses listing. */
router.get('/', function(req, res, next) {
  res.render('courses', { title: 'Courses' });
});

/* GET courses listing. */
router.get('/:slug', function(req, res, next) {
  res.render('courses', { title: `Course with slug ${req.params.slug}` });
});

module.exports = router;
