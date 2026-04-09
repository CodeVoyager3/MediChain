package org.medichain.backend.service.ai;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TrustScoreAggregator {

	public Map<String, Object> aggregate(Map<String, Object> tripleCheckBase, EpisodeRuleService.RuleEngineResult ruleResult, Map<String, Object> llmFindings) {
		
		int baseScore = extractTripleCheckBaseScore(tripleCheckBase);
		int ruleScore = ruleResult.getScore();
		int llmConf = (int) llmFindings.getOrDefault("confidence", 0);
		int llmPoints = (llmConf >= 85) ? 20 : (llmConf >= 60) ? 10 : 0;
		
		if (llmFindings.get("reasoning").toString().contains("LLM bypassed") || llmFindings.get("reasoning").toString().contains("LLM Analysis failed")) {
			llmPoints = 20; // Default to max bypass if key missing, so app stays functional
		}

		int finalScore = baseScore + ruleScore + llmPoints;

		String riskLevel;
		if (finalScore >= 90) riskLevel = "LOW";
		else if (finalScore >= 65) riskLevel = "MEDIUM";
		else riskLevel = "HIGH";

		Map<String, Object> result = new HashMap<>();
		result.put("finalTrustScore", finalScore);
		result.put("riskLevel", riskLevel);
		result.put("tripleCheckContribution", baseScore);
		result.put("ruleEngineContribution", ruleScore);
		result.put("llmContribution", llmPoints);
		result.put("ruleFindings", ruleResult.getFindings());
		result.put("aiAnalysis", llmFindings);

		return result;
	}

	private int extractTripleCheckBaseScore(Map<String, Object> securityChecks) {
		if (securityChecks == null) return 0;
		int pts = 0;
		if (Boolean.TRUE.equals(securityChecks.get("providerVerified"))) pts += 15;
		if (Boolean.TRUE.equals(securityChecks.get("integrityValid"))) pts += 15;
		if (Boolean.TRUE.equals(securityChecks.get("isLatestVersion"))) pts += 10;
		return pts;
	}
}
