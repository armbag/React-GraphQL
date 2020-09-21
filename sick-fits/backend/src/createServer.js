const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const db = require('./db')
console.log('dedans')
const { ApolloServer, gql } = require('apollo-server-express')
console.log('dedans hello')

function createServer() {
	// const schema = makeExecutableSchema({
	// 	typeDefs: schemaGql,
	// 	resolvers: {
	// 		Mutation,
	// 		Query,
	// 	},
	// })

	return new ApolloServer({
		typeDefs: 'src/schema.graphql',
		resolvers: {
			Mutation,
			Query,
		},
		context: (req) => ({ ...req, db }),
		playground: process.env.NODE_ENV === 'development',
		debug: process.env.NODE_ENV === 'development',
	})
}

module.exports = createServer
