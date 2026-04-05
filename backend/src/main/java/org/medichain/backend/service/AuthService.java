package org.medichain.backend.service;

import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.entity.User;
import org.medichain.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Hash;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.security.Key;
import java.util.Arrays;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {
	
	private final UserRepository userRepository;
	
	private final long JWT_EXPIRATION_MS = 86400000; // 24 hours
	
	public AuthService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}
	@Value("${jwt.secret}")
	private String jwtSecretString;
	
	// Helper method to convert the String from properties into a Cryptographic Key
	public Key getSigningKey() {
		byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(jwtSecretString);
		return io.jsonwebtoken.security.Keys.hmacShaKeyFor(keyBytes);
	}
	
	// Step 1 of Login: Generate a challenge for the user to sign
	public String generateNonce(String walletAddress) {
		String nonce = UUID.randomUUID().toString();
		
		// Find user or create a temporary skeleton user if they are new
		User user = userRepository.findByWalletAddressIgnoreCase(walletAddress)
				.orElseGet(() -> {
					User newUser = new User();
					newUser.setWalletAddress(walletAddress);
					newUser.setRole("UNREGISTERED");
					return newUser;
				});
		
		user.setNonce(nonce);
		userRepository.save(user);
		return "Sign this message to login to MediChain: " + nonce;
	}
	
	// Step 2 of Login: Verify the signature and issue JWT
	public String verifySignatureAndIssueJwt(String claimedAddress, String signature) {
		Optional<User> userOpt = userRepository.findByWalletAddressIgnoreCase(claimedAddress);
		if (userOpt.isEmpty() || userOpt.get().getNonce() == null) {
			throw new RuntimeException("User not found or nonce missing. Request a nonce first.");
		}
		
		User user = userOpt.get();
		String expectedMessage = "Sign this message to login to MediChain: " + user.getNonce();
		
		try {
			// Web3 Math: Recover the public key from the signature
			String prefix = "\u0019Ethereum Signed Message:\n" + expectedMessage.length();
			byte[] msgHash = Hash.sha3((prefix + expectedMessage).getBytes());
			byte[] signatureBytes = Numeric.hexStringToByteArray(signature);
			
			byte v = signatureBytes[64];
			if (v < 27) v += 27; // MetaMask standard adjustment
			
			Sign.SignatureData sd = new Sign.SignatureData(v,
					Arrays.copyOfRange(signatureBytes, 0, 32),
					Arrays.copyOfRange(signatureBytes, 32, 64));
			
			BigInteger pubKey = Sign.signedMessageHashToKey(msgHash, sd);
			String recoveredAddress = "0x" + org.web3j.crypto.Keys.getAddress(pubKey);
			
			// Did the signature actually come from the claimed wallet?
			if (recoveredAddress.equalsIgnoreCase(claimedAddress)) {
				log.info("Cryptographic signature verified for {}", claimedAddress);
				
				// Roll the nonce so it can't be reused (Replay Attack Prevention)
				user.setNonce(null);
				userRepository.save(user);
				
				// Issue the JWT
				return Jwts.builder()
						.setSubject(user.getWalletAddress())
						.claim("role", user.getRole())
						.setIssuedAt(new Date())
						.setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
						.signWith(getSigningKey())
						.compact();
			} else {
				throw new RuntimeException("Signature verification failed. Recovered address did not match.");
			}
		} catch (Exception e) {
			log.error("Cryptographic verification error", e);
			throw new RuntimeException("Invalid signature data.");
		}
	}
}
