const route = {
	AUTH: {
		ROOT: '/auth',
		LOGIN: '/auth/login',
		SIGNUP: '/auth/signup',
		FORGOT_PASSWORD: '/auth/forgot-password',
	},
	SERVICE: {
		ROOT: '/',
		WRITE: '/new',
		ARCHIVES: '/archives',
		SETTINGS: {
			ROOT: '/settings',
			MYACCOUNT_PROFILE: '/settings/myaccount/profile',
			SUBSCRIPTION: '/settings/myaccount/subscription',
		},
		NOT_FOUND: '/*',
	},
};

export default route;
