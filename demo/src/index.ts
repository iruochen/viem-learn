import {
	createPublicClient,
	createWalletClient,
	formatEther,
	getContract,
	http,
	parseEther,
	publicActions,
} from 'viem'
import { foundry } from 'viem/chains'
import dotenv from 'dotenv'
import { privateKeyToAccount } from 'viem/accounts'

import ERC20_ABI from './abis/MyToken.json' with { type: 'json' }

dotenv.config()
const ERC20_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'

const main = async () => {
	const publicClient = createPublicClient({
		chain: foundry,
		transport: http(process.env.RPC_URL!),
	}).extend(publicActions)

	const blockNumber = await publicClient.getBlockNumber()
	console.log('Current Block Number:', blockNumber)

	const balance = await publicClient.getBalance({
		address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
	})
	console.log('Account Balance:', formatEther(balance), 'ETH')

	const account = privateKeyToAccount(process.env.PRIVATE_KEY! as `0x${string}`)

	const walletClient = createWalletClient({
		account,
		chain: foundry,
		transport: http(process.env.RPC_URL!),
	}).extend(publicActions)

	const userAddress = await walletClient.getAddresses()
	console.log(`The wallet address is: ${userAddress[0]}`)

	const hash1 = await walletClient.sendTransaction({
		account,
		to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
		value: parseEther('0.01'),
	})
	console.log('Transaction hash1 :', hash1)

	const erc20Contract = getContract({
		address: ERC20_ADDRESS,
		abi: ERC20_ABI,
		client: {
			public: publicClient,
			wallet: walletClient,
		},
	})

	// read contract
	const balance1 = formatEther(
		(await erc20Contract.read?.balanceOf?.([userAddress[0]])) as bigint,
	)
	console.log(`address ${userAddress[0]} has token balance: ${balance1}`)

	// read contract2
	const balance2 = formatEther(
		(await publicClient.readContract({
			address: ERC20_ADDRESS,
			abi: ERC20_ABI,
			functionName: 'balanceOf',
			args: [userAddress[0]],
		})) as bigint,
	)
	console.log(`address ${userAddress[0]} has token balance: ${balance2}`)
}

main()
