package com.a407.sniffythedog.adapter.in.common.exepction;

import com.a407.sniffythedog.adapter.in.common.response.SocketResponse;
import com.a407.sniffythedog.application.common.exception.ApplicationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.time.ZonedDateTime;
import java.util.UUID;

@ControllerAdvice
public class SocketExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(SocketExceptionHandler.class);

    @MessageExceptionHandler(ApplicationException.class)
    @SendToUser("/queue/errors")
    public SocketResponse<String> handleApplicationException(ApplicationException e) {
        log.warn("Socket ApplicationException: {} - {}", e.getErrorCode(), e.getMessage());
        return new SocketResponse<>(
                "ERROR",
                UUID.randomUUID().toString(),
                ZonedDateTime.now(),
                null, // RoomCode를 알 수 없는 경우 null
                e.getMessage()
        );
    }

    @MessageExceptionHandler(Exception.class)
    @SendToUser("/queue/errors")
    public SocketResponse<String> handleException(Exception e) {
        log.error("Socket Unhandled Exception: ", e);
        return new SocketResponse<>(
                "ERROR",
                UUID.randomUUID().toString(),
                ZonedDateTime.now(),
                null,
                "Internal Server Error"
        );
    }
}
