import {
	createPublicClient,
	createWalletClient,
	formatEther,
	getContract,
	http,
	parseEther,
	parseEventLogs,
	publicActions,
} from 'viem'
import { foundry } from 'viem/chains'
import dotenv from 'dotenv'
import { privateKeyToAccount } from 'viem/accounts'

import ERC20_ABI from './abis/MyToken.json' with { type: 'json' }
import COUNTER_ABI from './abis/Counter.json' with { type: 'json' }

dotenv.config()
const ERC20_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
const COUNTER_ADDRESS = '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853'

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

	const counterContract = getContract({
		address: COUNTER_ADDRESS,
		abi: COUNTER_ABI,
		client: {
			public: publicClient,
			wallet: walletClient,
		},
	})

	const tx = await counterContract.write?.increment?.()
	console.log('Counter increment tx hash:', tx)

	const receipt = await publicClient.waitForTransactionReceipt({
		hash: tx as `0x${string}`,
	})
	// console.log('Transaction receipt:', receipt)

	const number1 = await counterContract.read?.number?.()
	console.log('Counter number after increment:', number1)

	// write contract2
	await walletClient.writeContract({
		address: COUNTER_ADDRESS,
		abi: COUNTER_ABI,
		functionName: 'increment',
		args: [],
	})

	const number2 = await publicClient.readContract({
		address: COUNTER_ADDRESS,
		abi: COUNTER_ABI,
		functionName: 'number',
		args: [],
	})
	console.log('Counter number after increment:', number2)

	const tx2 = await erc20Contract.write?.transfer?.([
		'0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
		parseEther('10'),
	])
	console.log('ERC20 transfer tx hash:', tx2)
	const receipt2 = await publicClient.waitForTransactionReceipt({
		hash: tx2 as `0x${string}`,
	})
	// console.log('ERC20 Transfer Transaction receipt:', receipt2)
	const transferLogs = await parseEventLogs({
		abi: ERC20_ABI,
		eventName: 'Transfer',
		logs: receipt2.logs,
	})
	console.log('Parsed Transfer event logs:', transferLogs)
}

main()
