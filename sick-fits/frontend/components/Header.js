import Link from 'next/link';
import styled from 'styled-components';
import NProgress from 'nprogress';
import Router from 'next/router';
import Nav from './Nav';
import Cart from './Cart';
import Search from './Search';

Router.onRouteChangeStart = () => {
	NProgress.start();
};
Router.onRouteChangeComplete = () => {
	NProgress.done();
};
Router.onRouteChangeError = () => {
	NProgress.done();
};

const Logo = styled.h1`
	font-size: 4rem;
	margin-left: 2rem;
	position: relative;
	z-index: 2;
	transform: skew(-7deg);
	a {
		padding: 0.5rem 1rem;
		background: ${(props) => props.theme.red};
		color: white;
		text-transform: uppercase;
		text-decoration: none;
	}
	@media (max-width: 1300px) {
		margin: 0;
		text-align: center;
	}
`;

const StyleHeader = styled.header`
	.bar {
		border-bottom: 10px solid ${(props) => props.theme.black};
		/* display: flex;
		flex-direction: row; */
		display: grid;
		/* grid-auto-columns: 1fr 1fr; */
		grid-template-columns: repeat(2, 1fr);
		justify-content: space-evenly;
		align-items: stretch;
		@media (max-width: 1300px) {
			grid-template-columns: 1fr;
			justify-content: space-evenly;
		}
	}
	.sub-bar {
		display: grid;
		grid-template-columns: 1fr auto;
		border-bottom: 1px solid ${(props) => props.theme.lightgrey};
	}
`;

const Header = () => (
	<StyleHeader>
		<div className="bar">
			<Logo>
				<Link href="/">
					<a>Sick Fits</a>
				</Link>
			</Logo>
			<Nav />
		</div>
		<div className="sub-bar">
			<Search />
		</div>
		<Cart />
	</StyleHeader>
);

export default Header;
