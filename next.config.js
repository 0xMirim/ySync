/* eslint-disable @typescript-eslint/explicit-function-return-type */
const withPWA = require('next-pwa');
const {PHASE_EXPORT} = require('next/constants');

module.exports = (phase) => withPWA({
	assetPrefix: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT ? './' : '/',
	experimental: {
		images: {
			unoptimized: process.env.IPFS_BUILD === 'true' || phase === PHASE_EXPORT //Exporting image does not support optimization
		}
	},
	images: {
		domains: [
			'rawcdn.githack.com',
			'raw.githubusercontent.com'
		]
	},
	pwa: {
		dest: 'public',
		disable: process.env.NODE_ENV !== 'production'
	},
	env: {
		/* 🔵 - Yearn Finance **************************************************
		** Config over the RPC
		**********************************************************************/
		WEB_SOCKET_URL: {
			1: process.env.WS_URL_MAINNET,
			10: process.env.WS_URL_OPTIMISM,
			250: process.env.WS_URL_FANTOM,
			42161: process.env.WS_URL_ARBITRUM
		},
		JSON_RPC_URL: {
			1: process.env.RPC_URL_MAINNET,
			10: process.env.RPC_URL_OPTIMISM,
			250: process.env.RPC_URL_FANTOM,
			42161: process.env.RPC_URL_ARBITRUM
		},
		ALCHEMY_KEY: process.env.ALCHEMY_KEY,
		INFURA_KEY: process.env.INFURA_KEY
	}
});
