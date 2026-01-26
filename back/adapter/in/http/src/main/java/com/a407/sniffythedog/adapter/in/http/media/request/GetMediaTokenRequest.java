package com.a407.sniffythedog.adapter.in.http.media.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class GetMediaTokenRequest {

    @NotBlank(message = "roomId는 필수입니다")
    private String roomId;

    @NotBlank(message = "userId는 필수입니다")
    private String userId;
}
