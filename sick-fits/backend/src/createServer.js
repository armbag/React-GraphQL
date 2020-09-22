const Mutation = require('./resolvers/Mutation')
const Query = require('./resolvers/Query')
const db = require('./db')
const {
	ApolloServer,
	makeExecutableSchema,
	gql,
} = require('apollo-server-express')
const typeDefs = gql`
	# # import * from './generated/prisma.graphql'

	type SuccessMessage {
		message: String
	}

	type Mutation {
		createItem(
			title: String
			description: String
			price: Int
			image: String
			largeImage: String
		): Item!
		updateItem(id: ID!, title: String, description: String, price: Int): Item!
		deleteItem(id: ID!): Item
		signup(email: String!, password: String!, name: String!): User!
		signin(email: String!, password: String!): User!
		signout: SuccessMessage
		requestReset(email: String!): SuccessMessage
		resetPassword(
			resetToken: String!
			password: String!
			confirmPassword: String!
		): User!
		updatePermissions(permissions: [Permission], userId: ID!): User
		addToCart(id: ID!): CartItem
		removeFromCart(id: ID!): CartItem
		createOrder(token: String!): Order!
	}

	type Query {
		items(
			where: ItemWhereInput
			orderBy: ItemOrderByInput
			skip: Int
			first: Int
		): [Item]!
		item(where: ItemWhereUniqueInput!): Item
		itemsConnection(where: ItemWhereInput): ItemConnection!
		me: User
		users: [User]!
		order(id: ID!): Order
		orders(orderBy: OrderOrderByInput): [Order]!
	}

	type User {
		id: ID!
		name: String!
		email: String!
		permissions: [Permission!]!
		cart: [CartItem!]!
	}
`

console.log('----------in create server before call----------')
function createServer() {
	const schema = makeExecutableSchema({
		typeDefs: typeDefs,
		resolvers: {
			Mutation,
			Query,
		},
	})
	console.log(schema)

	return new ApolloServer({
		schema,
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
