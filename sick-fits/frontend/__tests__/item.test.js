import ItemComponent from '../components/Item'
import { shallow } from 'enzyme'
import toJSON from 'enzyme-to-json'

const fakeItem = {
	id: 'ABC123',
	title: 'cool item',
	price: 4000,
	description: 'This item is really cool!',
	image: 'dog.jpg',
	largeImage: 'largedog.jpg',
}

describe('<Item />', () => {
	it('renders and matchs the snapshot', () => {
		const wrapper = shallow(<ItemComponent item={fakeItem} />)
		expect(toJSON(wrapper)).toMatchSnapshot()
	})
	// it('renders the image properly', () => {
	// 	const wrapper = shallow(<ItemComponent item={fakeItem} />)
	// 	const img = wrapper.find('img')
	// 	expect(img.props().src).toBe(fakeItem.image)
	// 	expect(img.props().alt).toBe(fakeItem.title)
	// })

	// it('renders the priceTag and title', () => {
	// 	const wrapper = shallow(<ItemComponent item={fakeItem} />)
	// 	const PriceTag = wrapper.find('PriceTag')
	// 	// console.log(PriceTag.dive().text())
	// 	// console.log(PriceTag.children().text())
	// 	expect(PriceTag.children().text()).toBe('$5')
	// 	expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
	// })

	// it('renders out the buttons properly', () => {
	// 	const wrapper = shallow(<ItemComponent item={fakeItem} />)
	// 	const buttonList = wrapper.find('.buttonList')
	// 	expect(buttonList.children()).toHaveLength(3)
	// 	expect(buttonList.find('DeleteItem')).toBeTruthy()
	// })
})
