// this file connects to the remote prisma DB
// and gives us the ability to query it with JS
const { Prisma } = require('prisma-binding')

const db = new Prisma({
	typeDefs: 'src/generated/prisma.graphql',
	endpoint: 'https://production-54ck-0fbb7e2e9f.herokuapp.com/backend/prod',
	secret: process.env.PRISMA_SECRET,
	debug: false,
})

module.exports = db
