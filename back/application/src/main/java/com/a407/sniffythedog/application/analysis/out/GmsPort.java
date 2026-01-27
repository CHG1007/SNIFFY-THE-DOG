package com.a407.sniffythedog.application.analysis.out;

import com.a407.sniffythedog.domain.analysis.enums.AiModel;

import java.util.List;
import java.util.Map;

public interface GmsPort {

    String analyze(String modelName, List<Map<String, Object>> payload);
}

