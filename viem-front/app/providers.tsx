"use client"
import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, http, WagmiProvider } from "wagmi"
import { foundry, optimism, sepolia } from "wagmi/chains"

const config = createConfig({
	chains: [sepolia, foundry, optimism],
	transports: {
		[sepolia.id]: http(),
		[foundry.id]: http(),
		[optimism.id]: http(),
	},
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</WagmiProvider>
	)
}
