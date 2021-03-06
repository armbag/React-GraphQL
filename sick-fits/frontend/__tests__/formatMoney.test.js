import formatMoney from '../lib/formatMoney'

describe('formatMoney function', () => {
	it('works with fractional dollars', () => {
		expect(formatMoney(1)).toEqual('$0.01')
		expect(formatMoney(10)).toEqual('$0.10')
	})
	it('leaves cents off for whole dollars', () => {
		expect(formatMoney(5000)).toEqual('$50')
		expect(formatMoney(100)).toEqual('$1')
		expect(formatMoney(50000000)).toEqual('$500,000')
	})
	it('works with whole and fractionnal dollars', () => {
		expect(formatMoney(5012)).toEqual('$50.12')
		expect(formatMoney(101)).toEqual('$1.01')
	})
})
