package com.a407.sniffythedog.application.game.scheduler;


import com.a407.sniffythedog.application.game.scheduler.event.PhaseTimeoutEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Component
@RequiredArgsConstructor
public class PhaseScheduler {

    private final TaskScheduler taskScheduler;
    private final ApplicationEventPublisher eventPublisher;
    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    public void scheduleEvent(String roomCode, Instant executionTime, Object event) {
        // 1. 기존 스케줄 취소
        cancelSchedule(roomCode);

        // 2. 새로운 스케줄 등록
        ScheduledFuture<?> future = taskScheduler.schedule(() -> {
            // 전달받은 이벤트를 그대로 발행
            eventPublisher.publishEvent(event);
            scheduledTasks.remove(roomCode);
        }, executionTime);

        scheduledTasks.put(roomCode, future);
    }

    public boolean cancelSchedule(String roomCode) {
        ScheduledFuture<?> future = scheduledTasks.remove(roomCode);
        if (future != null) {
            future.cancel(false);
            return true;
        }
        return false;
    }

}
