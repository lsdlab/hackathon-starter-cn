const Q = require('q')
const bcrypt = require('bcrypt-nodejs')
const db = require('../routes/db')

/**
 * find existing user
 */
function findUserByEmail(email) {
  var userPromise = db.any('select * from users where email=$1', [email])
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

function updateProfile(email, name, bio, url, location, id) {
  var userPromise = db.none('update users set email=$1, name=$2, bio=$3, url=$4, location=$5 where id=$6', [email, name, bio, url, location, id])
  return userPromise
}

function updatePassword(password, id) {
  var userPromise = db.none('update users set password=$1 where id=$2', [password, id])
  return userPromise
}

function deleteUser(id) {
  var userPromise = db.none('delete from users where id=$1', [id])
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
module.exports.updateProfile = updateProfile
module.exports.updatePassword = updatePassword
module.exports.deleteUser = deleteUser
module.exports.generateHashedPassword = generateHashedPassword
module.exports.comparePassword = comparePassword
