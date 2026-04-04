package org.medichain.backend.repository;

import org.medichain.backend.entity.ClinicCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckInRepository extends JpaRepository<ClinicCheckIn, Long> {
	// For the Doctor's Dashboard: Show all patients currently waiting
	List<ClinicCheckIn> findByDoctorAddressIgnoreCaseAndStatusOrderByCheckInTimeDesc(String doctorAddress, String status);
	
	// Ensures a doctor can only complete their OWN appointments
	Optional<ClinicCheckIn> findByIdAndDoctorAddressIgnoreCase(Long id, String doctorAddress);
}
