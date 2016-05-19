var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        pagename: 'awesome people',
        authors: ['Paul', 'Jim', 'Jane']
    });
});

/* GET 404 page. */
router.get('/404', function(req, res, next) {
    res.render('404');
});

module.exports = router;
