"use client"

import { useEffect } from "react"
import COUNTER_ABI from "./contracts/Counter.json"
import {
	useConnection,
	useChainId,
	useChains,
	useConnect,
	useDisconnect,
	useBalance,
	useReadContract,
	useWriteContract,
} from "wagmi"
import { injected } from "wagmi/connectors"
import { formatUnits } from "viem"

const COUNTER_ADDRESS = "0x47E8324c29e823B45B08424ED1B564BD27E458dd"

export default function Home() {
	const { address, isConnected } = useConnection()
	const { mutate: connect } = useConnect()
	const { mutate: disconnect } = useDisconnect()
	const chainId = useChainId()
	const chains = useChains()
	const currentChain = chains.find((chain) => chain.id === chainId)

	const { data: balance } = useBalance({
		address,
	})

	const { data: counterNumber, refetch: refetchCounter } = useReadContract({
		address: COUNTER_ADDRESS,
		abi: COUNTER_ABI,
		functionName: "number",
	})

	const {
		mutate: writeContract,
		isPending,
		data: hash,
		isSuccess,
		isError,
		error,
	} = useWriteContract()

	const handleIncrement = () => {
		writeContract({
			address: COUNTER_ADDRESS,
			abi: COUNTER_ABI,
			functionName: "increment",
		})
	}

	useEffect(() => {
		if (isSuccess) {
			refetchCounter()
		}
	}, [isSuccess, refetchCounter])

	return (
		<div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-8">
			<div className="w-full max-w-3xl">
				<div className="text-center mb-10">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient">
						Viem Web3 Demo
					</h1>
					<p className="text-gray-600 text-sm sm:text-base">
						基于 Viem + Wagmi 的现代化 Web3 应用
					</p>
				</div>

				<div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden hover:shadow-3xl transition-all duration-300">
					<div className="p-6 sm:p-8 lg:p-10">
						<div className="mb-6">
							<a
								href="/siwe"
								className="group block w-full text-center text-base sm:text-lg font-bold text-white bg-linear-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 py-4 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
							>
								<span className="relative z-10 flex items-center justify-center gap-2">
									<span>🔐</span>
									<span>前往 SIWE 登录演示</span>
								</span>
								<div className="absolute inset-0 bg-linear-to-r from-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</a>
						</div>

						{!isConnected ? (
							<button
								onClick={() => connect({ connector: injected() })}
								className="group w-full text-base sm:text-lg font-bold text-white bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-5 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
							>
								<span className="relative z-10 flex items-center justify-center gap-3">
									<span className="text-2xl">🦊</span>
									<span>连接 MetaMask 钱包</span>
								</span>
								<div className="absolute inset-0 bg-linear-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</button>
						) : (
							<div className="space-y-6">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
									<div className="bg-linear-to-br from-slate-50 to-slate-100/80 rounded-2xl p-5 border-2 border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:shadow-md">
										<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
											<span>👛</span>
											<span>钱包地址</span>
										</p>
										<p className="font-mono text-xs sm:text-sm break-all text-slate-800 font-medium">
											{address}
										</p>
									</div>

									<div className="bg-linear-to-br from-indigo-50 to-indigo-100/80 rounded-2xl p-5 border-2 border-indigo-200/80 hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
										<p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2 flex items-center gap-2">
											<span>🌐</span>
											<span>当前网络</span>
										</p>
										<p className="font-mono text-xs sm:text-sm text-indigo-900 font-bold">
											{currentChain?.name || "未知网络"}
										</p>
										<p className="font-mono text-xs text-indigo-600 mt-1">
											Chain ID: {chainId}
										</p>
									</div>

									<div className="bg-linear-to-br from-emerald-50 to-emerald-100/80 rounded-2xl p-5 border-2 border-emerald-200/80 hover:border-emerald-300 transition-all duration-300 hover:shadow-md">
										<p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-2 flex items-center gap-2">
											<span>💰</span>
											<span>账户余额</span>
										</p>
										<p className="font-mono text-xl sm:text-2xl font-black text-emerald-700">
											{balance
												? Number(
														formatUnits(balance.value, balance.decimals),
													).toFixed(4)
												: "0.0000"}
										</p>
										<p className="text-xs text-emerald-600 mt-1 font-semibold">
											{balance?.symbol || "ETH"}
										</p>
									</div>

									<div className="bg-linear-to-br from-amber-50 to-amber-100/80 rounded-2xl p-5 border-2 border-amber-200/80 hover:border-amber-300 transition-all duration-300 hover:shadow-md">
										<p className="text-xs font-semibold text-amber-500 uppercase tracking-wide mb-2 flex items-center gap-2">
											<span>🔢</span>
											<span>Counter 数值</span>
										</p>
										<p className="font-mono text-3xl sm:text-4xl font-black text-amber-700">
											{counterNumber?.toString() || "0"}
										</p>
									</div>
								</div>

								{(hash || isError) && (
									<div className="space-y-2">
										{hash && (
											<div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-xl">
												<p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
													<span>✅</span>
													<span>交易哈希:</span>
												</p>
												<p className="text-xs font-mono text-blue-600 break-all mt-1">
													{hash}
												</p>
											</div>
										)}
										{isError && (
											<div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
												<p className="text-sm font-semibold text-red-800 flex items-center gap-2">
													<span>❌</span>
													<span>错误:</span>
												</p>
												<p className="text-xs text-red-600 mt-1">
													{error?.message}
												</p>
											</div>
										)}
									</div>
								)}

								<div className="flex flex-col sm:flex-row gap-3">
									<button
										onClick={handleIncrement}
										disabled={isPending}
										className="group relative flex-1 text-base sm:text-lg font-bold text-white bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-4 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg overflow-hidden"
									>
										<span
											className={`relative z-10 flex items-center justify-center gap-2 ${isPending ? "opacity-0" : "opacity-100"}`}
										>
											<span>➕</span>
											<span>增加计数</span>
										</span>
										{isPending && (
											<span className="absolute inset-0 flex items-center justify-center text-white font-bold">
												<span className="animate-pulse">⏳ 交易进行中...</span>
											</span>
										)}
										<div className="absolute inset-0 bg-linear-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									</button>

									<button
										onClick={() => disconnect()}
										className="group flex-1 text-base sm:text-lg font-bold text-white bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 py-4 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
									>
										<span className="relative z-10 flex items-center justify-center gap-2">
											<span>🔌</span>
											<span>断开连接</span>
										</span>
										<div className="absolute inset-0 bg-linear-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				<p className="text-center text-gray-400 mt-6 text-xs sm:text-sm font-medium">
					⚡ Powered by Viem + Wagmi + Tailwind CSS
				</p>
			</div>
		</div>
	)
}
