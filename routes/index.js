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
})

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
  var file = fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('md/about', { markdownContent: markdownContent })
  })
})


router.get('/scaffold', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/scaffold.md'
  var file = fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('md/scaffold', { markdownContent: markdownContent })
  })
})


router.get('/api', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/api.md'
  var file = fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('md/api', { markdownContent: markdownContent })
  })
})


router.get('/postmark', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/postmark.md'
  var file = fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('md/postmark', { markdownContent: markdownContent })
  })
})


router.get('/sendgrid', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/sendgrid.md'
  var file = fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('md/sendgrid', { markdownContent: markdownContent })
  })
})


router.get('/nodemailer', function(req, res) {
  var path = __dirname.slice(0, -7) + '/views/markdown/nodemailer.md'
  var file = fs.readFile(path, 'utf8', function(err, data) {
    if(err) {
      console.log(err)
    }
    var markdownContent = marked(data)
    res.render('md/nodemailer', { markdownContent: markdownContent })
  })
})


module.exports = router
