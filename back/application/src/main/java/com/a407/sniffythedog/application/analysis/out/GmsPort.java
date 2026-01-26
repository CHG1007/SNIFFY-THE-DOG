package com.a407.sniffythedog.application.analysis.out;

import com.a407.sniffythedog.domain.analysis.enums.AiModel;
import java.util.Map;

public interface GmsPort {

    String analyze(String modelName, Map<String, Object> payload);
}

