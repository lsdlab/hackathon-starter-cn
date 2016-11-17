require('dotenv').config()
const chalk = require('chalk')
const pgp = require('pg-promise')()

const cn = process.env.POSTGRESQL_URL

const db = pgp(cn)

console.log('%s PostgreSQL connection established!', chalk.blue('✓'))

// Exporting the database object for shared use:
module.exports = db
