package com.a407.sniffythedog.adapter.in.http.media.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class GetMediaTokenResponse {

    private String sessionId;
    private String token;
}
