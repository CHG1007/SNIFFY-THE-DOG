package com.a407.sniffythedog.domain.room.vo;

public record RoomId(String value) {
    // record는 매개변수 대입해줘서 String value 다시 안써줘도 됨
    public RoomId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("roomId is blank");
        }
    }

    // 객체 만드는 것 : of로 해야 문자열을 RoomId로 변환한다. 라는 의미 잘 보임
    public static RoomId of(String value) {
        return new RoomId(value);
    }
}
