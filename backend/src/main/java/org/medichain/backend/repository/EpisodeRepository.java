package org.medichain.backend.repository;

import org.medichain.backend.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, Long> {
	List<Episode> findByPatientAddressIgnoreCaseOrderByCreatedAtDesc(String patientAddress);
}
