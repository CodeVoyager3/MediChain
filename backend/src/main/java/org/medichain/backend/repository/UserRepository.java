package org.medichain.backend.repository;

import org.medichain.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
	Optional<User> findByWalletAddressIgnoreCase(String walletAddress);
}
