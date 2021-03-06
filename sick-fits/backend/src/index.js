require('dotenv').config({ path: 'variables.env' })
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const createServer = require('./createServer')
const express = require('express')
const db = require('./db')

const app = express()
// Use express middleware to handle cookies (JWT)

const server = createServer()

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

server.applyMiddleware({
	app,
	cors: {
		credentials: true,
		origin: 'https://new-51ck-next.herokuapp.com',
	},
})
// server.applyMiddleware({
// 	app,
// 	cors: false,
// })
const port = process.env.PORT || 4444
app.listen({ port }, () =>
	console.log(
		`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
	)
)
