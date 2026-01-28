package com.a407.sniffythedog.application.common.exception;

public enum ExceptionType {

    // 공통 예외
    BAD_REQUEST("C400", 400, "잘못된 요청입니다."),
    UNAUTHORIZED("C401", 401, "인증이 필요합니다."),
    FORBIDDEN("C403", 403, "접근 권한이 없습니다."),
    NOT_FOUND("C404", 404, "리소스를 찾을 수 없습니다."),
    CONFLICT("C409", 409, "리소스 충돌이 발생했습니다."),
    VALIDATION_ERROR("C422", 422, "유효성 검증에 실패했습니다."),
    INTERNAL_SERVER_ERROR("S500", 500, "서버 내부 오류가 발생했습니다."),

    // 사용자 예외
    USER_NOT_FOUND("U001", 404, "사용자를 찾을 수 없습니다."),
    INVALID_NICKNAME("U002", 400, "닉네임 형식이 올바르지 않습니다."),
    DUPLICATE_NICKNAME("U003", 409, "이미 존재하는 닉네임입니다."),
    USER_BANNED("U004", 403, "정지된 사용자입니다."),
    USER_DELETED("U005", 400, "탈퇴한 사용자입니다."),

    // 인증 예외
    INVALID_TOKEN("A001", 401, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN("A002", 401, "만료된 토큰입니다."),
    OAUTH_FAILED("A003", 401, "소셜 로그인에 실패했습니다."),

    // 게임/방 예외
    ROOM_NOT_FOUND("R001", 404, "방을 찾을 수 없습니다."),
    INVITE_CODE_NOT_FOUND("R014", 404, "초대 코드가 존재하지 않거나 만료되었습니다."),
    ROOM_FULL("R002", 409, "방이 가득 찼습니다."),
    ROOM_NOT_WAITING("R003", 400, "대기 중인 방이 아닙니다."),
    ALREADY_IN_ROOM("R004", 409, "이미 방에 참가 중입니다."),
    NOT_IN_ROOM("R005", 400, "방에 참가 중이 아닙니다."),
    NOT_ENOUGH_PLAYERS("R006", 400, "플레이어가 부족합니다."),
    NOT_ALL_READY("R007", 400, "모든 플레이어가 준비되지 않았습니다."),
    GAME_ALREADY_STARTED("R008", 400, "게임이 이미 시작되었습니다."),
    GAME_NOT_IN_PROGRESS("R009", 400, "진행 중인 게임이 아닙니다."),
    INVALID_PHASE("R010", 400, "현재 페이즈에서 수행할 수 없는 동작입니다."),
    PLAYER_DEAD("R011", 400, "사망한 플레이어입니다."),
    NO_CHANCE_LEFT("R012", 400, "AI 찬스를 모두 사용했습니다."),
    NOT_CITIZEN("R013", 400, "시민만 AI 찬스를 사용할 수 있습니다."),
    ROOM_CONCURRENT_UPDATE_FAILED("R409", 409, "방 상태가 동시에 변경되어 요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요."),
    ROOM_NOT_JOINABLE("R004", 409, "현재 입장/진행이 불가능한 방입니다."),
    NOT_ALLOWED("R005", 403, "요청 권한이 없습니다."),
    ALREADY_VOTED("R006", 409, "이미 투표를 완료했습니다."),
    INVALID_GAME_STATE("R008", 400, "게임 대기 중에만 강퇴할 수 있습니다."),
    INVALID_REQUEST("R014", 400, "자기 자신을 강퇴할 수 없습니다."),

    // 신고 예외
    REPORT_NOT_FOUND("P001", 404, "신고를 찾을 수 없습니다."),
    CANNOT_REPORT_SELF("P002", 400, "자기 자신을 신고할 수 없습니다."),
    ALREADY_REPORTED("P003", 409, "이미 신고한 사용자입니다."),
    REPORT_ALREADY_PROCESSED("P004", 400, "이미 처리된 신고입니다.");

    private final String errorCode;
    private final int httpStatusCode;
    private final String message;

    ExceptionType(String errorCode, int httpStatusCode, String message) {
        this.errorCode = errorCode;
        this.httpStatusCode = httpStatusCode;
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public int getHttpStatusCode() {
        return httpStatusCode;
    }

    public String getMessage() {
        return message;
    }
}
