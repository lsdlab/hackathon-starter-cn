const express = require('express')
const router = express.Router()
const fs = require('fs')
const marked = require('marked')

/**
 * GET /
 * Index page.
 */
router.get('/', function(req, res) {
  res.render('index', { title: 'index' })
})

/* GET 404 page. */
router.get('/404', function(req, res) {
  res.render('404')
})


router.get('/about', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/about.md'
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('about', { markdownContent: markdownContent, title: 'about' })
  })
})

router.get('/introduction', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/introduction.md'
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('introduction', { markdownContent: markdownContent, title: 'introduction' })
  })
})

router.get('/scaffold', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/scaffold.md'
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('scaffold', { markdownContent: markdownContent, title: 'introduction' })
  })
})


router.get('/api', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/api.md'
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('api', { markdownContent: markdownContent, title: 'introduction' })
  })
})


router.get('/email', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/email.md'
  fs.readFile(path, 'utf8', function(err, data) {
    if (err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('email', { markdownContent: markdownContent, title: 'introduction' })
  })
})


module.exports = router
