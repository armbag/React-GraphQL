const { forwardTo } = require('prisma-binding')
const { hasPermission } = require('../utils')

const Query = {
	items: forwardTo('db'),
	item: forwardTo('db'),
	itemsConnection: forwardTo('db'),
	me(parent, args, ctx, info) {
		// check if there is a current user id
		if (!ctx.req.userId) {
			return null
		}
		return ctx.db.query.user(
			{
				where: { id: ctx.req.userId },
			},
			info
		)
	},
	async users(parent, args, ctx, info) {
		// 1 Check if they are logged in
		if (!ctx.req.userId) {
			throw new Error('You must be logged in!')
		}
		// 2 check if the user has the permissions to query all the users

		// TODO PUT IT BACK
		hasPermission(ctx.req.user, ['ADMIN', 'PERMISSIONUPDATE'])

		// 3 if they do, query all the users
		return ctx.db.query.users({}, info)
	},

	async order(parent, args, ctx, info) {
		// 1 make sure they logged in
		if (!ctx.req.userId) {
			throw new Error('You must be logged in!')
		}
		// 2 query the current order
		const order = await ctx.db.query.order(
			{
				where: { id: args.id },
			},
			info
		)
		// 3 check if they have permission to see this order
		const ownsOrder = order.user.id === ctx.req.userId
		const hasPermissionToSeeOrder = ctx.req.user.permissions.includes('ADMIN')
		if (!ownsOrder || !hasPermission) {
			throw new Error("You don't have access to this")
		}
		// 4 return the order
		return order
	},
	async orders(parent, args, ctx, info) {
		const { userId } = ctx.req
		if (!userId) {
			throw new Error('you must be signed in')
		}
		return ctx.db.query.orders(
			{
				where: {
					user: {
						id: userId,
					},
				},
			},
			info
		)
	},
}

module.exports = Query
