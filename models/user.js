const Q = require('q')
const bcrypt = require('bcrypt-nodejs')
const db = require('../routes/db')

/**
 * find existing user
 */
function findUserByEmail(email) {
  var userPromise = db.one('select * from users where email=$1', [email])
  return userPromise
}

function findUserByID(id) {
  var userPromise = db.one('select * from users where id=$1', [id])
  return userPromise
}

function findUserByQuickLoginToken(quickLoginToken) {
  var userPromise = db.one('select * from users where quick_login_token=$1', [quickLoginToken])
  return userPromise
}

function findUserByGitHub(id) {
  var userPromise = db.any('select * from users where github=$1', [id])
  return userPromise
}

function updateProfile(email, name, bio, url, location, id) {
  var userPromise = db.none('update users set email=$1, name=$2, bio=$3, url=$4, location=$5 where id=&6', [email, name, bio, url, location, id])
  return userPromise
}

function updateGitHubProfile(github, tokens, name, bio, url, location, provider, id) {
  var userPromise = db.none('update users set github=$1, tokens=$2, name=$3, bio=$4, url=$5, location=$6, provider=&7 where id=&8', [github, tokens, name, bio, url, location, provider, id])
  return userPromise
}

function updateGitHubEmailProfile(email, github, tokens, name, bio, url, location, provider, id) {
  var userPromise = db.none('update users set email=$1, github=$2, tokens=$3, name=$4, bio=$5, url=$6, location=$7, provider=&8 where id=&9', [email, github, tokens, name, bio, url, location, provider, id])
  return userPromise
}

function deleteUser(id) {
  var userPromise = db.none('delete users where id=$1', [id])
  return userPromise
}

/**
 * Password hash middleware.
 */
function generateHashedPassword(password) {
  var generateHashedPasswordDefer = Q.defer()

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      generateHashedPasswordDefer.reject(err)
    }
    bcrypt.hash(password, salt, null, (err, hash) => {
      if (err) {
        generateHashedPasswordDefer.reject(err)
      }
      generateHashedPasswordDefer.resolve(hash)
    })
  })

  return generateHashedPasswordDefer.promise
}

/**
 * Helper method for validating user's password.
 */
function comparePassword(candidatePassword, userPassword) {
  var comparePasswordDefer = Q.defer()

  bcrypt.compare(candidatePassword, userPassword, (err, isMatch) => {
    if (err) {
      comparePasswordDefer.reject(err)
    } else {
      comparePasswordDefer.resolve(isMatch)
    }
  })

  return comparePasswordDefer.promise
}


module.exports.findUserByEmail = findUserByEmail
module.exports.findUserByID = findUserByID
module.exports.findUserByQuickLoginToken = findUserByQuickLoginToken
module.exports.findUserByGitHub = findUserByGitHub
module.exports.updateProfile = updateProfile
module.exports.updateGitHubProfile = updateGitHubProfile
module.exports.updateGitHubEmailProfile = updateGitHubEmailProfile
module.exports.deleteUser = deleteUser
module.exports.generateHashedPassword = generateHashedPassword
module.exports.comparePassword = comparePassword
