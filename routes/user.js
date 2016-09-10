const express = require('express')
const router = express.Router()

const User = require('../models/user')
const passport = require('passport')

/**
 * GET /signup
 * Signup page.
 */
router.get('/signup', function(req, res) {
    if (req.user) {
        req.flash('success', { msg: 'Success! You are logged in.' })
        return res.redirect('/')
    }
    res.render('user/signup', {
        title: 'signup'
    })
})

/**
 * POST /signup
 * Create a new local account.
 */
router.post('/signup', function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail()
    req.assert('password', 'Password must be at least 6 characters long').len(6)
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

    var errors = req.validationErrors()

    if (errors) {
        req.flash('errors', errors)
        return res.redirect('/signup')
    }

    var user = new User({
        email: req.body.email,
        password: req.body.password
    })

    User.findOne({ email: req.body.email }, function(err, existingUser) {
        if (existingUser) {
            req.flash('errors', { msg: 'Account with that email address already exists.' })
            return res.redirect('/signup')
        }
        user.save(function(err) {
            if (err) {
                return next(err)
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err)
                }
                res.redirect('/')
            })
        })
    })
})


/**
 * GET /login
 * Login page.
 */
router.get('/login', function(req, res) {
    if (req.user) {
        return res.redirect('/')
    }
    res.render('user/login', {
        title: 'login'
    })
})

/**
 * POST /login
 * Sign in using email and password.
 */
router.post('/login', function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail()
    req.assert('password', 'Password cannot be blank').notEmpty()

    var errors = req.validationErrors()

    if (errors) {
        req.flash('errors', errors)
        return res.redirect('/login')
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err)
        }
        if (!user) {
            req.flash('errors', { msg: info.message })
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err)
            }
            req.flash('success', { msg: 'Success! You are logged in.' })
            res.redirect(req.session.returnTo || '/')
        })
    })(req, res, next)
})

/**
 * GET /logout
 * Log out.
 */
router.get('/logout', function(req, res) {
    req.logout()
    res.redirect('/')
})


/**
 * GET /account
 * Profile page.
 */
router.get('/account', function(req, res) {
    if (!req.user) {
        return res.redirect('/login')
    }
    res.render('user/profile')
})

/**
 * POST /account/profile
 * Update profile information.
 */
router.post('/account/profile', function(req, res, next) {
    User.findById(req.user.id, function(err, user) {
        if (err) {
            return next(err)
        }
        user.email = req.body.email || ''
        user.profile.name = req.body.name || ''
        user.profile.gender = req.body.gender || ''
        user.profile.location = req.body.location || ''
        user.profile.website = req.body.website || ''
        user.save(function(err) {
            if (err) {
                return next(err)
            }
            req.flash('success', { msg: 'Profile information updated.' })
            res.redirect('/account')
        })
    })
})

/**
 * POST /account/password
 * Update current password.
 */
router.post('/account/password', function(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4)
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

    var errors = req.validationErrors()

    if (errors) {
        req.flash('errors', errors)
        return res.redirect('/account')
    }

    User.findById(req.user.id, function(err, user) {
        if (err) {
            return next(err)
        }
        user.password = req.body.password
        user.save(function(err) {
            if (err) {
                return next(err)
            }
            req.flash('success', { msg: 'Password has been changed.' })
            res.redirect('/account')
        })
    })
})

/**
 * POST /account/delete
 * Delete user account.
 */
router.post('/account/delete', function(req, res, next) {
    User.remove({ _id: req.user.id }, function(err) {
        if (err) {
            return next(err)
        }
        req.logout()
        req.flash('info', { msg: 'Your account has been deleted.' })
        res.redirect('/')
    })
})

module.exports = router

