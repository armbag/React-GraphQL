import { mount } from 'enzyme'
import wait from 'waait'
import PleaseSignIn from '../components/PleaseSignIn'
import { CURRENT_USER_QUERY } from '../components/User'
import { MockedProvider } from 'react-apollo/test-utils'
import { fakeUser } from '../lib/testUtils'

const notSignedInMocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: null } },
	},
]

const signedInMocks = [
	{
		request: { query: CURRENT_USER_QUERY },
		result: { data: { me: fakeUser() } },
	},
]

describe('<PleaseSignedInasdf />', () => {
	it('renders the sign in dialog to logged out the users', async () => {
		const wrapper = mount(
			<MockedProvider mocks={notSignedInMocks}>
				<PleaseSignIn />
			</MockedProvider>
		)
		await wait()
		wrapper.update()
		expect(wrapper.text()).toContain('Please Sign In before continuing')
		expect(wrapper.find('Signin').exists()).toBe(true)
	})

	it('rendres the child component when the user is signed in', async () => {
		const Hey = () => <p>Hey!</p>
		const wrapper = mount(
			<MockedProvider mocks={signedInMocks}>
				<PleaseSignIn>
					<Hey />
				</PleaseSignIn>
			</MockedProvider>
		)
		await wait()
		wrapper.update()
		// expect(wrapper.find('Hey').exists()).toBe(true)
		expect(wrapper.contains(<Hey />)).toBe(true)
	})
})