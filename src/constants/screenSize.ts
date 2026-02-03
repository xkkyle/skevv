const MIN_PREFIX = 'min-width';
const MAX_PREFIX = 'max-width';

const screenSize = {
	MIN_XS: `(${MIN_PREFIX}: 480px)`,
	MIN_SM: `(${MIN_PREFIX}: 640px)`,
	MIN_MD: `(${MIN_PREFIX}: 768px)`,
	MIN_LG: `(${MIN_PREFIX}: 1024px)`,
	MIN_XL: `(${MIN_PREFIX}: 1280px)`,
	MIN_2XL: `(${MIN_PREFIX}: 1536px)`,

	MAX_XS: `(${MAX_PREFIX}: 480px)`,
	MAX_SM: `(${MAX_PREFIX}: 640px)`,
	MAX_MD: `(${MAX_PREFIX}: 768px)`,
	MAX_LG: `(${MAX_PREFIX}: 1024px)`,
	MAX_XL: `(${MAX_PREFIX}: 1280px)`,
	MAX_2XL: `(${MAX_PREFIX}: 1536px)`,
};

export default screenSize;
