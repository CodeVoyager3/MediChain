package org.medichain.backend.service.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiAnalysisService {
	@Value("${gemini.api.key}")
	private String apiKey;

	@Value("${gemini.model.name:gemini-1.5-flash}")
	private String modelName;

	private final RestTemplate restTemplate = new RestTemplate();
	private final ObjectMapper objectMapper = new ObjectMapper();

	public Map<String, Object> analyze(Map<String, Object> episodeJson, List<EpisodeRuleService.RuleFinding> ruleFindings) {
		if (apiKey == null || apiKey.equals("YOUR_GEMINI_KEY") || apiKey.isEmpty()) {
			log.warn("Gemini API key is not configured. Skipping Layer 2 LLM Analysis.");
			return Map.of("additional_anomalies", List.of(), "risk_level", "LOW", "confidence", 100, "reasoning", "LLM bypassed due to missing API Key.", "recommendation", "APPROVE");
		}

		try {
			String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, apiKey);

			String prompt = "You are a medical insurance fraud detection AI.\n" +
					"Analyze the following Episode of Care for logical inconsistencies, " +
					"impossible sequences, or suspicious patterns.\n\n" +
					"Episode Data (JSON): " + objectMapper.writeValueAsString(episodeJson) + "\n\n" +
					"Rule Engine Pre-Findings: " + objectMapper.writeValueAsString(ruleFindings) + "\n\n" +
					"Respond ONLY in this exact JSON format, no preamble:\n" +
					"{\n" +
					"  \"additional_anomalies\": [\"string\", \"string\"],\n" +
					"  \"risk_level\": \"LOW\" | \"MEDIUM\" | \"HIGH\",\n" +
					"  \"confidence\": 0-100,\n" +
					"  \"reasoning\": \"2-3 sentence plain English explanation\",\n" +
					"  \"recommendation\": \"APPROVE\" | \"REVIEW\" | \"REJECT\"\n" +
					"}";

			Map<String, Object> parts = Map.of("text", prompt);
			Map<String, Object> content = Map.of("parts", List.of(parts));
			Map<String, Object> body = Map.of("contents", List.of(content));

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

			log.info("Triggering Gemini LLM request...");
			Map<String, Object> response = restTemplate.postForObject(url, requestEntity, Map.class);
			
			// Parse the LLM response text
			List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
			Map<String, Object> contentResp = (Map<String, Object>) candidates.get(0).get("content");
			List<Map<String, Object>> resParts = (List<Map<String, Object>>) contentResp.get("parts");
			String llmOutput = (String) resParts.get(0).get("text");

			// Clean up potential markdown formatting block
			String cleanedOutput = llmOutput.replaceAll("(?s)^.*?(\\{.*\\}).*?$", "$1").trim();
			
			try {
				return objectMapper.readValue(cleanedOutput, Map.class);
			} catch (Exception parseEx) {
				log.error("Failed to parse Gemini JSON. Raw output: {}", llmOutput);
				throw parseEx;
			}

		} catch (Exception e) {
			log.error("Gemini LLM Call failed. Type: {}, Message: {}", e.getClass().getSimpleName(), e.getMessage());
			return Map.of(
					"additional_anomalies", List.of(),
					"risk_level", "HIGH", // Default to HIGH if we can't get a real answer, for safety
					"confidence", 0,
					"reasoning", "AI Engine Error: " + e.getMessage(), 
					"recommendation", "REVIEW"
			);
		}
	}
}
