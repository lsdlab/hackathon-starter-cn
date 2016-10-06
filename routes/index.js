const express = require('express')
const router = express.Router()
const fs = require('fs')
const marked = require('marked')

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

/**
 * GET /
 * Index page.
 */
router.get('/', function(req, res) {
  res.render('index', { title: 'index' })
})

router.get('/about', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/about.md'
  var file = fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('about', { markdownContent: markdownContent })
  });
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
