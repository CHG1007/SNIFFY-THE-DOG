package com.a407.sniffythedog.domain.analysis.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AiModel {
    GPT_5_MINI("gpt-5-mini"),
    GPT_5_NANO("gpt-5-nano"),
    GEMINI_FLASH_LITE("gemini-2.5-flash-lite"),
    INTERNAL_GMS("internal-gms");

    private final String code;
}

