package org.medichain.backend.service.ai;

import org.medichain.backend.entity.Episode;
import org.medichain.backend.entity.MedicalRecord;
import org.medichain.backend.entity.User;
import org.medichain.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class EpisodeMetadataBuilder {

	private final UserRepository userRepository;

	public EpisodeMetadataBuilder(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	/**
	 * Builds the structured JSON metadata for an episode, matching the spec format:
	 * { episode_title, patient_address, records: [ { record_id, type, date, doctor, is_superseded, amount } ] }
	 */
	public Map<String, Object> buildMetadata(Episode episode, List<MedicalRecord> records) {
		Map<String, Object> metadata = new LinkedHashMap<>();
		metadata.put("episode_title", episode.getTitle());
		metadata.put("patient_address", episode.getPatientAddress());

		List<Map<String, Object>> recordList = new ArrayList<>();
		for (MedicalRecord r : records) {
			Map<String, Object> entry = new LinkedHashMap<>();
			entry.put("record_id", r.getRecordId());
			entry.put("type", r.getRecordType());
			
			// Add date from createdAt (critical for Impossible Date Sequence rule)
			entry.put("date", r.getCreatedAt() != null ? r.getCreatedAt().toLocalDate().toString() : null);
			
			// Resolve doctor name from wallet address
			String doctorName = userRepository.findByWalletAddressIgnoreCase(r.getDoctorAddress())
					.map(User::getName)
					.orElse(r.getDoctorAddress());
			entry.put("doctor", doctorName);
			
			entry.put("is_superseded", r.isSuperseded());
			
			// Amount field (null for now — ready for future use when bill amounts are tracked)
			entry.put("amount", null);
			
			recordList.add(entry);
		}

		metadata.put("records", recordList);
		return metadata;
	}
}
