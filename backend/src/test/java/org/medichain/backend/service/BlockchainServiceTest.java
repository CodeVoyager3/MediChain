package org.medichain.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.medichain.backend.entity.MedicalRecord;
import org.medichain.backend.repository.AccessGrantRepository;
import org.medichain.backend.repository.MedicalRecordRepository;
import org.medichain.backend.repository.UserRepository;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.web3j.protocol.Web3j;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BlockchainServiceTest {

	@Mock
	private Web3j web3j;
	@Mock
	private MedicalRecordRepository medicalRecordRepository;
	@Mock
	private AccessGrantRepository accessGrantRepository;
	@Mock
	private UserRepository userRepository;

	private BlockchainService blockchainService;

	@BeforeEach
	void setUp() {
		blockchainService = new BlockchainService(web3j, medicalRecordRepository, accessGrantRepository, userRepository);
	}

	@Test
	void getVerifiedRecordForInsurer_deniesWhenSqlGrantExpired() {
		when(accessGrantRepository.existsByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordIdAndExpiresAtAfter(
				eq("0xpatient"), eq("0xinsurer"), eq(10L), any()
		)).thenReturn(false);

		RuntimeException ex = assertThrows(RuntimeException.class,
				() -> blockchainService.getVerifiedRecordForInsurer("0xinsurer", "0xpatient", 10L));

		assertEquals("ACCESS_DENIED_SQL_EXPIRED", ex.getMessage());
	}

	@Test
	void verifyEpisodeForInsurer_throwsWhenNoEpisodeRecords() {
		when(medicalRecordRepository.findByPatientAddressIgnoreCaseAndEpisodeIdOrderByRecordIdDesc("0xpatient", 7L))
				.thenReturn(List.of());

		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
				() -> blockchainService.verifyEpisodeForInsurer("0xinsurer", "0xpatient", 7L));

		assertEquals("No records found for this episode.", ex.getMessage());
	}

	@Test
	@SuppressWarnings("unchecked")
	void verifyEpisodeForInsurer_marksDeniedWhenSqlGrantMissing() {
		MedicalRecord record = new MedicalRecord();
		record.setRecordId(22L);
		record.setPatientAddress("0xpatient");
		record.setEpisodeId(3L);

		when(medicalRecordRepository.findByPatientAddressIgnoreCaseAndEpisodeIdOrderByRecordIdDesc("0xpatient", 3L))
				.thenReturn(List.of(record));
		when(accessGrantRepository.existsByPatientAddressIgnoreCaseAndViewerAddressIgnoreCaseAndRecordIdAndExpiresAtAfter(
				eq("0xpatient"), eq("0xinsurer"), eq(22L), any()
		)).thenReturn(false);

		Map<String, Object> result = blockchainService.verifyEpisodeForInsurer("0xinsurer", "0xpatient", 3L);
		assertEquals(1, result.get("totalRecords"));
		assertEquals(0, result.get("verifiedCount"));
		assertEquals(1, result.get("deniedCount"));

		List<Map<String, Object>> records = (List<Map<String, Object>>) result.get("records");
		assertFalse((Boolean) records.get(0).get("accessGranted"));
		assertEquals("Access denied. SQL grant missing or expired.", records.get(0).get("reason"));
	}
}
