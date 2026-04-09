package org.medichain.backend.service.ai;

import lombok.Data;
import org.medichain.backend.entity.MedicalRecord;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EpisodeRuleService {

	@Data
	public static class RuleFinding {
		private String ruleName;
		private int pointsDeducted;
		private String severity;
		private String description;

		public RuleFinding(String ruleName, int pointsDeducted, String severity, String description) {
			this.ruleName = ruleName;
			this.pointsDeducted = pointsDeducted;
			this.severity = severity;
			this.description = description;
		}
	}

	@Data
	public static class RuleEngineResult {
		private int score;
		private List<RuleFinding> findings = new ArrayList<>();
		
		public void addFinding(RuleFinding finding) {
			findings.add(finding);
			score = Math.max(0, score - finding.pointsDeducted);
		}
	}

	public RuleEngineResult analyzeRecords(List<MedicalRecord> records) {
		RuleEngineResult result = new RuleEngineResult();
		result.setScore(40); // Max Layer 1 score

		List<MedicalRecord> activeRecords = records.stream().filter(r -> !r.isSuperseded()).collect(Collectors.toList());
		
		// Rule 1: Impossible Date Sequence (-30 pts)
		// Lab Report or Surgery Report dated BEFORE the Diagnosis in the same episode
		checkImpossibleDateSequence(activeRecords, result);

		// Rule 2: Missing Referral Link (-20 pts)
		// Multiple doctors but no Referral record
		checkMissingReferralLink(activeRecords, result);

		// Rule 3: Bill Without Procedure (-25 pts)
		// A Final Bill exists but no Surgery/Procedure report
		checkBillWithoutProcedure(activeRecords, result);

		// Rule 4: Duplicate Record Type (-15 pts)
		// More than one non-superseded record of the SAME type
		checkDuplicateRecordType(activeRecords, result);

		// Rule 5: Same-Day Multi-Hospital (-35 pts)
		// Same patient has records from different doctors on the exact same day
		// (Simplified: different doctor addresses on same date)
		checkSameDayMultiDoctor(activeRecords, result);

		return result;
	}

	private void checkImpossibleDateSequence(List<MedicalRecord> records, RuleEngineResult result) {
		// Find the earliest Diagnosis date
		Optional<LocalDate> diagnosisDate = records.stream()
				.filter(r -> "Diagnosis".equalsIgnoreCase(r.getRecordType()))
				.map(r -> r.getCreatedAt().toLocalDate())
				.min(Comparator.naturalOrder());

		if (diagnosisDate.isPresent()) {
			LocalDate diagDate = diagnosisDate.get();
			
			// Check if any Lab Report is dated BEFORE the diagnosis
			boolean labBeforeDiagnosis = records.stream()
					.filter(r -> "Lab Report".equalsIgnoreCase(r.getRecordType()))
					.anyMatch(r -> r.getCreatedAt().toLocalDate().isBefore(diagDate));
			
			// Check if any Surgery Report is dated BEFORE the diagnosis
			boolean surgeryBeforeDiagnosis = records.stream()
					.filter(r -> "Surgery Report".equalsIgnoreCase(r.getRecordType()))
					.anyMatch(r -> r.getCreatedAt().toLocalDate().isBefore(diagDate));
			
			if (labBeforeDiagnosis || surgeryBeforeDiagnosis) {
				String detail = labBeforeDiagnosis 
						? "Lab Report is dated before the Diagnosis — medically impossible sequence."
						: "Surgery Report is dated before the Diagnosis — medically impossible sequence.";
				result.addFinding(new RuleFinding("Impossible Date Sequence", 30, "RED", detail));
			}
		}
	}

	private void checkMissingReferralLink(List<MedicalRecord> records, RuleEngineResult result) {
		Set<String> distinctDoctors = records.stream()
				.map(MedicalRecord::getDoctorAddress)
				.collect(Collectors.toSet());
		boolean hasReferral = records.stream()
				.anyMatch(r -> "Referral".equalsIgnoreCase(r.getRecordType()));
		
		if (distinctDoctors.size() > 1 && !hasReferral) {
			result.addFinding(new RuleFinding(
					"Missing Referral Link", 20, "ORANGE",
					"Multiple providers (" + distinctDoctors.size() + ") observed but no referral document found."
			));
		}
	}

	private void checkBillWithoutProcedure(List<MedicalRecord> records, RuleEngineResult result) {
		boolean hasBill = records.stream()
				.anyMatch(r -> "Final Bill".equalsIgnoreCase(r.getRecordType()) || "Bill".equalsIgnoreCase(r.getRecordType()));
		boolean hasProcedure = records.stream()
				.anyMatch(r -> "Surgery Report".equalsIgnoreCase(r.getRecordType()) || "Procedure".equalsIgnoreCase(r.getRecordType()));
		
		if (hasBill && !hasProcedure) {
			result.addFinding(new RuleFinding(
					"Bill Without Procedure", 25, "RED",
					"A Final Bill exists but no Procedure or Surgery Report is linked."
			));
		}
	}

	private void checkDuplicateRecordType(List<MedicalRecord> records, RuleEngineResult result) {
		// Check ALL types for duplicates, not just Final Bill
		Map<String, Long> typeCounts = records.stream()
				.collect(Collectors.groupingBy(
						r -> r.getRecordType() != null ? r.getRecordType().toLowerCase() : "unknown",
						Collectors.counting()
				));
		
		for (Map.Entry<String, Long> entry : typeCounts.entrySet()) {
			if (entry.getValue() > 1) {
				result.addFinding(new RuleFinding(
						"Duplicate Record Type", 15, "ORANGE",
						"Multiple non-superseded '" + entry.getKey() + "' records detected (" + entry.getValue() + " instances)."
				));
				break; // Only deduct once even if multiple types are duplicated
			}
		}
	}

	private void checkSameDayMultiDoctor(List<MedicalRecord> records, RuleEngineResult result) {
		// Group records by date, then check if any single day has records from different doctors
		Map<LocalDate, Set<String>> doctorsByDate = new HashMap<>();
		
		for (MedicalRecord r : records) {
			if (r.getCreatedAt() != null) {
				LocalDate date = r.getCreatedAt().toLocalDate();
				doctorsByDate.computeIfAbsent(date, k -> new HashSet<>()).add(r.getDoctorAddress().toLowerCase());
			}
		}
		
		for (Map.Entry<LocalDate, Set<String>> entry : doctorsByDate.entrySet()) {
			if (entry.getValue().size() > 2) { // More than 2 different doctors on same day is suspicious
				result.addFinding(new RuleFinding(
						"Same-Day Multi-Hospital", 35, "RED",
						"Records from " + entry.getValue().size() + " different providers on " + entry.getKey() + ". Potential cross-hospital billing fraud."
				));
				break;
			}
		}
	}
}
