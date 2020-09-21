console.log('----------------------------------avant')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
console.log('----------------------------------apres require apollo')
const createServer = require('./createServer')
const db = require('./db')
require('dotenv').config({ path: 'variables.env' })

const app = express()
const path = '/graphql'

const server = createServer()
console.log('Apres')
// Use express middleware to handle cookies (JWT)
app.use(cookieParser())

// Decode the jwt so we can get the user id on each request
app.use((req, res, next) => {
	const { token } = req.cookies
	if (token) {
		const { userId } = jwt.verify(token, process.env.APP_SECRET)
		// put the userId onto the req for future requests to access
		req.userId = userId
	}
	next()
})
//  Create a middleware that populates the user on each request

app.use(async (req, res, next) => {
	// if they're not logged in, skip this
	if (!req.userId) return next()
	const user = await db.query.user(
		{ where: { id: req.userId } },
		'{id, permissions, email, name}'
	)
	req.user = user
	next()
})

server.applyMiddleware({ app })

app.listen({ port: 4000 }, () =>
	console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
