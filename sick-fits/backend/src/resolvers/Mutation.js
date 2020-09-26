const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const { transport, makeANiceEmail } = require('../mail.js')
const { hasPermission } = require('../utils')
const stripe = require('../stripe')

const Mutations = {
	async createItem(parent, args, ctx, info) {
		// check if they logged in
		if (!ctx.req.userId) {
			throw new Error('You must be logged in to do that!')
		}

		const item = await ctx.db.mutation.createItem(
			{
				data: {
					// this is how to create a relationship between item and the user
					user: {
						connect: {
							id: ctx.req.userId,
						},
					},
					...args,
				},
			},
			info
		)

		return item
	},
	updateItem(parent, args, ctx, info) {
		// first take a copy of the updates
		const updates = { ...args }
		// remove the ID from the updates
		delete updates.id
		// run the update method
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: {
					id: args.id,
				},
			},
			info
		)
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id }
		// 1 find the item
		const item = await ctx.db.query.item({ where }, `{id title user { id }}`)
		// 2 check if they own that item, or have the permissions
		const ownsItem = item.user.id === ctx.req.userId
		const hasPermissions = ctx.req.user.permissions.some((permission) =>
			['ADMIN', 'ITEMDELETE'].includes(permission)
		)
		if (!ownsItem && !hasPermissions) {
			throw new Error("You don't have permission to do that!")
		}
		// 3 delete it
		return ctx.db.mutation.deleteItem({ where }, info)
	},
	async signup(parent, args, ctx, info) {
		args.email = args.email.toLowerCase()
		// hash the password
		const password = await bcrypt.hash(args.password, 10)
		// create user in the database
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
					permissions: { set: ['USER'] },
				},
			},
			info
		)
		// create the jwt token for them
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
		// we set the jwt as a cookie on the response
		ctx.res.cookie('token', token, {
			// httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
			sameSite: 'None',
			secure: true,
		})
		// finally we return the user to the browser
		return user
	},
	async signin(parent, { email, password }, ctx, info) {
		// check if there is a user with that email
		console.log('JE RENTRE')
		const user = await ctx.db.query.user({ where: { email: email } })
		if (!user) {
			throw new Error(`No such user found for email ${email}`)
		}
		// check if their password is correct
		const valid = await bcrypt.compare(password, user.password)
		if (!valid) {
			throw new Error('Invalid Password!')
		}
		// generate the jwt token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
		// set the cookie with the token
		ctx.res.cookie('token', token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
			// sameSite: 'None',
			// secure: true,
		})
		// return the user
		return user
	},
	signout(parent, args, ctx, info) {
		ctx.res.clearCookie('token')
		return { message: 'Successfuly signed out!' }
	},
	async requestReset(parent, args, ctx, info) {
		// 1 check if this is a real user
		const user = await ctx.db.query.user({ where: { email: args.email } })
		if (!user) {
			throw new Error(`No such user foung for email ${args.email}`)
		}
		// 2 set a reset token and expiry on that user
		const randomBytesPromisefied = promisify(randomBytes)
		const resetToken = (await randomBytesPromisefied(20)).toString('hex')
		const resetTokenExpiry = Date.now() + 3600000 // 1 hour
		const res = await ctx.db.mutation.updateUser({
			where: { email: args.email },
			data: { resetToken, resetTokenExpiry },
		})
		// 3 email them that reset token
		const mailRes = await transport.sendMail({
			from: 'armen.bagramian@gmail.com',
			to: user.email,
			subject: 'Your Password Reset Token',
			html: makeANiceEmail(`Your password reset token is here!
			\n\n
			<a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">
				Click here to Reset
				</a>`),
		})

		//  4 return the message
		return { message: 'Thanks!' }
	},
	async resetPassword(parent, args, ctx, info) {
		// 1 check if the password match
		if (args.password !== args.confirmPassword) {
			throw new Error("passwords don't match!")
		}
		// 2 check if its a legit reset token
		const [user] = await ctx.db.query.users({
			where: {
				resetToken: args.resetToken,
				resetTokenExpiry_gte: Date.now() - 3600000,
			},
		})
		// 3 check if it's expired
		if (!user) {
			throw new Error('This token is either invalid or expired!')
		}
		// 4 hash their new password
		const password = await bcrypt.hash(args.password, 10)
		// 5 save the new password to the user and remove old resetToken fields
		const updatedUser = await ctx.db.mutation.updateUser({
			where: { email: user.email },
			data: {
				password,
				resetToken: null,
				resetTokenExpiry: null,
			},
		})
		// 6 generate jwt
		const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
		// 7 set the jwt cookie
		ctx.response.cookie('token', token, {
			// httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365,
			sameSite: 'None',
			secure: true,
		})
		// 8 return the new user
		return updatedUser
	},
	async updatePermissions(parent, args, ctx, info) {
		// 1 check if they logged in
		if (!ctx.req.userId) {
			throw new Error('You must be logged in')
		}
		// 2 query the current user
		const currentUser = await ctx.db.query.user(
			{
				where: {
					id: ctx.req.userId,
				},
			},
			info
		)
		// 3 check if they have permissions to do this
		hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE'])
		// 4 update the permissions
		return ctx.db.mutation.updateUser(
			{
				data: {
					permissions: {
						set: args.permissions,
					},
				},
				where: {
					id: args.userId,
				},
			},
			info
		)
	},
	async addToCart(parent, args, ctx, info) {
		// 1 make sure user signed in
		const { userId } = ctx.req
		if (!userId) {
			throw new Error('You must be signed in!')
		}
		// 2 query the users current cart
		const [existingCartItem] = await ctx.db.query.cartItems({
			where: {
				user: { id: userId },
				item: { id: args.id },
			},
		})
		// 3 check if that item is already in their cart increment by one if it is
		if (existingCartItem) {
			return ctx.db.mutation.updateCartItem(
				{
					where: { id: existingCartItem.id },
					data: { quantity: existingCartItem.quantity + 1 },
				},
				info
			)
		}
		// 4 if it's not create a fresh CartItem for that user
		return ctx.db.mutation.createCartItem(
			{
				data: {
					user: {
						connect: { id: userId },
					},
					item: {
						connect: { id: args.id },
					},
				},
			},
			info
		)
	},
	async removeFromCart(parent, args, ctx, info) {
		// 1 find the cart item
		const cartItem = await ctx.db.query.cartItem(
			{
				where: {
					id: args.id,
				},
			},
			`{id, user {id}}`
		)
		// 2 make sure we found an item
		if (!cartItem) throw new Error('No Cart Item Found!')
		// 3 make sure they own that cart item
		if (cartItem.user.id !== ctx.req.userId) {
			throw new Error("You don't own that item!")
		}
		// 4 delete that cart item
		return ctx.db.mutation.deleteCartItem(
			{
				where: { id: args.id },
			},
			info
		)
	},
	async createOrder(parent, args, ctx, info) {
		// 1 query the current user and make sure they're signed in
		const { userId } = ctx.req
		if (!userId) throw new Error('You must be signed in to complete this order')
		const user = await ctx.db.query.user(
			{ where: { id: userId } },
			`{
      id
      name
      email
      cart {
        id
        quantity
        item { title price id description image largeImage }
      }}`
		)
		// 2 recalculate the total for the price
		const amount = user.cart.reduce(
			(tally, cartItem) => tally + cartItem.item.price * cartItem.quantity,
			0
		)
		console.log(`AMOUNT IS ${amount}\n\n`)
		console.log(
			'_________________________USER FOUND IS__________________________________'
		)
		console.log(user)
		console.log('___________________________________________________________')
		// 3 Create the stripe charge(turn token into money)
		console.log(`HIS TOKEN FROM STRIPE IS ${args.token}`)
		console.log(
			'___________________________________________________________\n\n\n'
		)
		const customer = await stripe.customers
			.create({
				email: user.email,
				source: args.token,
			})
			.catch((err) => console.log(err))
		console.log(`CUSTOMER IS`)
		console.log(customer)
		console.log('------------------------------------------------')
		const charge = await stripe.charges.create({
			customer: customer.id,
			amount,
			currency: 'USD',
		})
		console.log(
			'__________________________CHARGE_________________________________'
		)
		console.log(charge)
		console.log('___________________________________________________________')
		// 4 Convert the cartItems to orderItems
		const orderItems = user.cart.map((cartItem) => {
			const orderItem = {
				...cartItem.item,
				quantity: cartItem.quantity,
				user: { connect: { id: userId } },
			}
			delete orderItem.id
			return orderItem
		})
		// 5 create the order
		const order = await ctx.db.mutation.createOrder({
			data: {
				total: charge.amount,
				charge: charge.id,
				items: { create: orderItems },
				user: { connect: { id: userId } },
			},
		})
		// 6 clean up - clear the users cart, delete cartItems
		const cartItemsIds = user.cart.map((cartItem) => cartItem.id)
		await ctx.db.mutation.deleteManyCartItems({
			where: {
				id_in: cartItemsIds,
			},
		})
		// 7 Return the order to the client
		console.log('----------THIS IS ORDER --------------------')
		console.log(order)
		return order
	},
}

module.exports = Mutations
