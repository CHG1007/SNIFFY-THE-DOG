package com.a407.sniffythedog.adapter.in.common.response;


import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.ZonedDateTime;

public class SocketResponse<T>{
    private String type;
    private String requestId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private ZonedDateTime timestamp;

    private String roomCode;
    private T data;

    public SocketResponse(String type, String requestId, ZonedDateTime timestamp, String roomCode, T data) {
        this.type = type;
        this.requestId = requestId;
        this.timestamp = timestamp;
        this.roomCode = roomCode;
        this.data = data;
    }

    public static <T> SocketResponse<T> of(String type, String requestId, String roomCode, T data) {
        return new SocketResponse<>(type, requestId, ZonedDateTime.now(), roomCode, data);
    }

    public String getType() {
        return type;
    }

    public String getRequestId() {
        return requestId;
    }

    public ZonedDateTime getTimestamp() {
        return timestamp;
    }

    public String getRoomCode() {
        return roomCode;
    }

    public T getData() {
        return data;
    }
}
