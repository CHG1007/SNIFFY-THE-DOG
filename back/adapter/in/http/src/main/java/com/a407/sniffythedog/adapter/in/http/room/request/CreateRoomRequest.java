package com.a407.sniffythedog.adapter.in.http.room.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public record CreateRoomRequest(
        @NotBlank(message = "방 제목은 필수입니다.")
        String title,

        @Min(value = 6, message = "최소 인원은 6명입니다.")
        @Max(value = 8, message = "최대 인원은 8명입니다.")
        int capacity,


        @JsonProperty("isPrivate")
        boolean isPrivate,

        Long hostUserId,
        String hostDisplayName
) {
}
