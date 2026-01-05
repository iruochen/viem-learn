"use client"

import { useEffect, useState } from "react"
import {
	createPublicClient,
	http,
	getContract,
	createWalletClient,
	custom,
	formatEther,
} from "viem"
import { sepolia } from "viem/chains"
import COUNTER_ABI from "./contracts/Counter.json"

const COUNTER_ADDRESS = "0x47E8324c29e823B45B08424ED1B564BD27E458dd"

export default function Home() {
	const [isConnected, setIsConnected] = useState(false)
	const [address, setAddress] = useState<`0x${string}` | undefined>()
	const [chainId, setChainId] = useState<number | undefined>()
	const [counterNumber, setCounterNumber] = useState<string>("0")
	const [balance, setBalance] = useState<string>("0")

	const [isIncrementing, setIsIncrementing] = useState(false)

	const publicClient = createPublicClient({
		chain: sepolia,
		transport: http(),
	})

	const connectWallet = async () => {
		if (typeof window.ethereum === "undefined") {
			alert("请安装 MetaMask")
			return
		}
		try {
			const [addr] = await window.ethereum.request({
				method: "eth_requestAccounts",
			})
			const chainIdHex: string = await window.ethereum.request({
				method: "eth_chainId",
			})
			const chainIdNum = parseInt(chainIdHex, 16)

			setAddress(addr as `0x${string}`)
			setChainId(chainIdNum)
			setIsConnected(true)
		} catch (error) {
			console.error("连接钱包失败:", error)
		}

		// 监听账户和链变化（原逻辑不动）
		window.ethereum.on("accountsChanged", (accounts: string[]) => {
			if (accounts.length === 0) {
				setIsConnected(false)
				setAddress(undefined)
				setChainId(undefined)
			} else {
				setAddress(accounts[0] as `0x${string}`)
			}
		})

		window.ethereum.on("chainChanged", (chainIdHex: string) => {
			setChainId(parseInt(chainIdHex, 16))
		})
	}

	const disconnectWallet = () => {
		setIsConnected(false)
		setAddress(undefined)
		setChainId(undefined)
		setCounterNumber("0")
		setBalance("0")
	}

	const fetchCounterNumber = async () => {
		if (!address) return

		const counterContract = getContract({
			address: COUNTER_ADDRESS,
			abi: COUNTER_ABI,
			client: publicClient,
		})

		try {
			const number = (await counterContract.read.number()) as bigint
			setCounterNumber(number.toString())
		} catch (error) {
			console.error("读取 counter 失败:", error)
			setCounterNumber("读取失败")
		}
	}

	const handleIncrement = async () => {
		if (!address || isIncrementing) return

		setIsIncrementing(true)

		const walletClient = createWalletClient({
			chain: sepolia,
			transport: custom(window.ethereum as any),
		})

		try {
			const hash = await walletClient.writeContract({
				address: COUNTER_ADDRESS,
				abi: COUNTER_ABI,
				functionName: "increment",
				account: address,
			})
			console.log("tx hash:", hash)

			await publicClient.waitForTransactionReceipt({ hash })
			console.log("交易已确认")

			await fetchCounterNumber()
		} catch (error) {
			console.error("调用 increment 失败", error)
			alert("交易失败或被用户拒绝")
		} finally {
			setIsIncrementing(false)
		}
	}

	useEffect(() => {
		if (!address) {
			setBalance("0")
			setCounterNumber("0")
			return
		}

		const fetchBalance = async () => {
			try {
				const bal = await publicClient.getBalance({ address })
				setBalance(formatEther(bal))
			} catch (error) {
				console.error("获取余额失败:", error)
				setBalance("读取失败")
			}
		}

		fetchBalance()
		fetchCounterNumber()
	}, [address])

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
			<div className="w-full max-w-2xl">
				<h1 className="text-5xl font-extrabold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
					Simple Viem Demo
				</h1>

				<div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
					<div className="p-8 lg:p-12">
						<div className="mb-8">
							<a
								href="/siwe"
								className="block w-full text-center text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
							>
								前往 SIWE 登录演示
							</a>
						</div>

						{!isConnected ? (
							<button
								onClick={connectWallet}
								className="w-full text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
							>
								连接 MetaMask
							</button>
						) : (
							<div className="space-y-8">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
										<p className="text-sm text-gray-600 mb-2">钱包地址</p>
										<p className="font-mono text-sm break-all text-gray-900">
											{address}
										</p>
									</div>

									<div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
										<p className="text-sm text-gray-600 mb-2">当前网络</p>
										<p className="font-mono text-sm text-indigo-800">
											{sepolia.name} (Chain ID: {chainId ?? "未知"})
										</p>
									</div>

									<div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
										<p className="text-sm text-gray-600 mb-2">余额</p>
										<p className="font-mono text-lg font-bold text-emerald-800">
											{balance} ETH
										</p>
									</div>

									<div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
										<p className="text-sm text-gray-600 mb-2">Counter 数值</p>
										<p className="font-mono text-2xl font-bold text-amber-800">
											{counterNumber}
										</p>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-4">
									<button
										onClick={handleIncrement}
										disabled={isIncrementing}
										className="relative flex-1 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
									>
										<span
											className={isIncrementing ? "opacity-0" : "opacity-100"}
										>
											增加计数
										</span>

										{isIncrementing && (
											<span className="absolute inset-0 flex items-center justify-center gap-3">
												<svg
													className="animate-spin h-5 w-5 text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
												<span>交易进行中...</span>
											</span>
										)}
									</button>

									<button
										onClick={disconnectWallet}
										className="flex-1 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
									>
										断开连接
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				<p className="text-center text-gray-500 mt-8 text-sm">
					Powered by Viem + Wagmi + Tailwind CSS
				</p>
			</div>
		</div>
	)
}
