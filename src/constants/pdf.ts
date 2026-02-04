const PDF_HQ = {
	KEY: 'application/pdf',
	VALUE: ['.pdf'],
};

const PDF_DEFAULT_HEIGHT = 426;

const formatBytes = (bytes: number, decimals = 1) => {
	if (bytes === 0) return '0 B';

	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const value = bytes / Math.pow(k, i);

	return `${value.toFixed(decimals)} ${sizes[i]}`;
};

function smartFormatBytes(bytes: number) {
	if (bytes < 1024) return `${bytes.toLocaleString()} B`;
	if (bytes < 1024 ** 2) return formatBytes(bytes, 0);
	if (bytes < 1024 ** 3) return formatBytes(bytes, 1);
	return formatBytes(bytes, 2);
}

export { PDF_DEFAULT_HEIGHT, PDF_HQ, formatBytes, smartFormatBytes };
