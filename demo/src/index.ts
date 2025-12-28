import {
	createPublicClient,
	createWalletClient,
	formatEther,
	http,
	publicActions,
} from "viem"
import { foundry } from "viem/chains"
import dotenv from "dotenv"

const main = async () => {
	const publicClient = createPublicClient({
		chain: foundry,
		transport: http(process.env.RPC_URL!),
	}).extend(publicActions)

	const blockNumber = await publicClient.getBlockNumber()
	console.log("Current Block Number:", blockNumber)

	const balance = await publicClient.getBalance({
		address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
	})
	console.log("Account Balance:", formatEther(balance), "ETH")
}

main()
