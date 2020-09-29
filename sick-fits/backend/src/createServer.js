const { ApolloServer } = require('apollo-server-express')
const { loadSchemaSync } = require('@graphql-tools/load')
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader')
const { addResolversToSchema } = require('@graphql-tools/schema')

const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const db = require('./db')
const path = require('path')

const schema = loadSchemaSync(path.join(__dirname, 'schema.graphql'), {
	loaders: [new GraphQLFileLoader()],
})

const resolvers = { Query, Mutation }

const schemaWithResolvers = addResolversToSchema({
	schema,
	resolvers,
})

function createServer() {
	return new ApolloServer({
		schema: schemaWithResolvers,
		resolvers: {
			Mutation,
			Query,
		},
		context: (req) => ({ ...req, db }),
		playground: true,
	})
}

module.exports = createServer
