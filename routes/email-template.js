const fs = require('fs')

require.extensions['.html'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8')
}

const welcome = require('../views/email/welcome.html')
const resetPassword = require('../views/email/reset-passpord.html')
const notifyUnlinkProvider = require('../views/email/notify-unlink-provider.html')
const notifyDeleteAccount = require('../views/email/notify-delete-account.html')
const notifySetupAPI = require('../views/email/notify-setup-api.html')
const userInvitaiton = require('../views/email/user-invitation.html')


module.exports.welcome = welcome
module.exports.resetPassword = resetPassword
module.exports.notifyUnlinkProvider = notifyUnlinkProvider
module.exports.notifyDeleteAccount = notifyDeleteAccount
module.exports.notifySetupAPI = notifySetupAPI
module.exports.userInvitaiton = userInvitaiton
