import dotenv from 'dotenv'
import { createPublicClient, publicActions, webSocket } from 'viem'
import { foundry } from 'viem/chains'

dotenv.config()
const ERC20_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

const main = async () => {
	const publicClient = createPublicClient({
		chain: foundry,
		transport: webSocket(process.env.RPC_URL!),
	}).extend(publicActions)

	console.log('Listening for transfer event...')
	const unWatch = publicClient.watchEvent({
		address: ERC20_ADDRESS,
		event: {
			type: 'event',
			name: 'Transfer',
			inputs: [
				{ type: 'address', name: 'from', indexed: true },
				{ type: 'address', name: 'to', indexed: true },
				{ type: 'uint256', name: 'value' },
			],
		},
		onLogs: (logs) => {
			logs.forEach((log) => {
				if (log.args.value !== undefined) {
					console.log(`Transfer event detected:`)
					console.log(`From: ${log.args.from}`)
					console.log(`To: ${log.args.to}`)
					console.log(`Value: ${log.args.value}`)
					console.log(`transactionHash: ${log.transactionHash}`)
					console.log(`blockNumber: ${log.blockNumber}`)
				}
			})
		},
	})

	process.on('SIGINT', () => {
		console.log('Stopping event listener...')
		unWatch()
		process.exit()
	})
}

main().catch((error) => {
	console.error('Error in watchTransfer script:', error)
	process.exit(1)
})
