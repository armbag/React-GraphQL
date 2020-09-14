import { mount } from 'enzyme'
import wait from 'waait'
import toJSON from 'enzyme-to-json'
import { MockedProvider } from 'react-apollo/test-utils'
import Signup, { SIGNUP_MUTATION } from '../components/Signup'
import { CURRENT_USER_QUERY } from '../components/User'
import { fakeUser } from '../lib/testUtils'

const me = fakeUser()
const mocks = [
	{
		request: {
			query: SIGNUP_MUTATION,
			variables: {
				email: me.email,
				name: me.name,
				password: 'wes',
			},
		},
		result: {
			data: {
				signup: {
					__typename: 'User',
					id: 'abc123',
					email: me.email,
					name: me.name,
				},
			},
		},
	},
	{
		request: {
			query: CURRENT_USER_QUERY,
		},
		result: { data: { me } },
	},
]

describe('<Signup />', () => {
	it('renders and matches snapshot', () => {
		const wrapper = mount(
			<MockedProvider>
				<Signup />
			</MockedProvider>
		)
		expect(toJSON(wrapper.find('form'))).toMatchSnapshot()
	})

	it('calls the mutation properly', async () => {})
})
