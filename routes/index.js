const express = require('express')
const router = express.Router()

/**
 * GET /
 * Index page.
 */
router.get('/', function(req, res) {
  res.render('index', { title: 'index' })
})

router.get('/about', function(req, res) {
  res.render('about', { title: 'about' })
})

/* GET 404 page. */
router.get('/404', function(req, res) {
  res.render('404')
})

/* GET working on page. */
router.get('/working-on', function(req, res) {
  res.render('working')
})

module.exports = router
