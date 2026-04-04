package org.medichain.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
public class Web3jConfig {
	
	// This is the public RPC URL for the Polygon Amoy Testnet
	private static final String POLYGON_AMOY_RPC = "https://rpc-amoy.polygon.technology";
	
	@Bean
	public Web3j web3j() {
		// Build the connection to the blockchain
		Web3j web3j = Web3j.build(new HttpService(POLYGON_AMOY_RPC));
		
		try {
			// Ping the network to ensure we are connected
			String clientVersion = web3j.web3ClientVersion().send().getWeb3ClientVersion();
			System.out.println("Successfully connected to Polygon Amoy!");
			System.out.println("Client Version: " + clientVersion);
		} catch (Exception e) {
			System.err.println("Failed to connect to the blockchain: " + e.getMessage());
		}
		
		return web3j;
	}
}
