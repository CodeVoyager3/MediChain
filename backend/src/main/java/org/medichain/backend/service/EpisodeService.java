package org.medichain.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.medichain.backend.entity.Episode;
import org.medichain.backend.entity.MedicalRecord;
import org.medichain.backend.repository.EpisodeRepository;
import org.medichain.backend.repository.MedicalRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EpisodeService {

	private final EpisodeRepository episodeRepository;
	private final MedicalRecordRepository medicalRecordRepository;

	public EpisodeService(EpisodeRepository episodeRepository,
			MedicalRecordRepository medicalRecordRepository) {
		this.episodeRepository = episodeRepository;
		this.medicalRecordRepository = medicalRecordRepository;
	}

	@Transactional
	public Episode createEpisode(String patientAddress, String title, String description, String createdBy) {
		Episode episode = new Episode();
		episode.setPatientAddress(patientAddress);
		episode.setTitle(title);
		episode.setDescription(description);
		episode.setCreatedBy(createdBy);
		return episodeRepository.save(episode);
	}

	/**
	 * Returns all episodes for a patient with nested records grouped under each episode.
	 * Also includes an "ungrouped" section for records where episode_id is null.
	 */
	public Map<String, Object> getPatientEpisodes(String patientAddress) {
		List<Episode> episodes = episodeRepository.findByPatientAddressIgnoreCaseOrderByCreatedAtDesc(patientAddress);
		List<MedicalRecord> allRecords = medicalRecordRepository.findByPatientAddressIgnoreCase(patientAddress);

		// Build grouped episodes list
		List<Map<String, Object>> episodeList = new ArrayList<>();
		for (Episode ep : episodes) {
			List<MedicalRecord> episodeRecords = allRecords.stream()
					.filter(r -> ep.getEpisodeId().equals(r.getEpisodeId()))
					.toList();

			Map<String, Object> episodeMap = new LinkedHashMap<>();
			episodeMap.put("episodeId", ep.getEpisodeId());
			episodeMap.put("patientAddress", ep.getPatientAddress());
			episodeMap.put("title", ep.getTitle());
			episodeMap.put("description", ep.getDescription());
			episodeMap.put("createdBy", ep.getCreatedBy());
			episodeMap.put("createdAt", ep.getCreatedAt());
			episodeMap.put("records", episodeRecords);
			episodeList.add(episodeMap);
		}

		// Ungrouped records (no episode_id)
		List<MedicalRecord> ungrouped = allRecords.stream()
				.filter(r -> r.getEpisodeId() == null)
				.toList();

		Map<String, Object> result = new LinkedHashMap<>();
		result.put("episodes", episodeList);
		result.put("ungroupedRecords", ungrouped);
		return result;
	}
}
