const { ApolloServer, makeExecutableSchema } = require('apollo-server-express')
const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const db = require('./db')
const schemaGql = require('./schema.graphql')

function createApolloServer() {
	const schema = makeExecutableSchema({
		typeDefs: schemaGql,
		resolvers: {
			Mutation,
			Query,
		},
	})

	return new ApolloServer({
		schema,
		context: (req) => ({ ...req, db }),
		playground: process.env.NODE_ENV === 'development',
		debug: process.env.NODE_ENV === 'development',
	})
}

module.exports = createApolloServer
