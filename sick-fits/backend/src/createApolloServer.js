console.log('dedans')
const { ApolloServer } = require('apollo-server-express')
console.log('dedans hello')
const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const db = require('./db')
const schemaGql = require('./schema.graphql')

function createApolloServer() {
	// const schema = makeExecutableSchema({
	// 	typeDefs: schemaGql,
	// 	resolvers: {
	// 		Mutation,
	// 		Query,
	// 	},
	// })

	return new ApolloServer({
		typeDefs: schemaGql,
		resolvers: {
			Mutation,
			Query,
		},
		context: (req) => ({ ...req, db }),
		playground: process.env.NODE_ENV === 'development',
		debug: process.env.NODE_ENV === 'development',
	})
}

module.exports = createApolloServer
