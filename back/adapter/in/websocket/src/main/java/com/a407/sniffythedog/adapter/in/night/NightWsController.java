package com.a407.sniffythedog.adapter.in.night;

import com.a407.sniffythedog.adapter.in.night.request.NightActionRequest;
import com.a407.sniffythedog.adapter.in.night.request.NightResolveRequest;
import com.a407.sniffythedog.application.night.in.*;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class NightWsController {

    private final MafiaNightUseCase mafiaUseCase;
    private final DoctorNightUseCase doctorUseCase;
    private final PoliceNightUseCase policeUseCase;
    private final NightResolveUseCase resolveUseCase;

    public NightWsController(
            MafiaNightUseCase mafiaUseCase,
            DoctorNightUseCase doctorUseCase,
            PoliceNightUseCase policeUseCase,
            NightResolveUseCase resolveUseCase
    ) {
        this.mafiaUseCase = mafiaUseCase;
        this.doctorUseCase = doctorUseCase;
        this.policeUseCase = policeUseCase;
        this.resolveUseCase = resolveUseCase;
    }

    // 마피아 확정
    @MessageMapping("/rooms/{roomCode}/night/mafia/confirm")
    public void mafiaConfirm(
            @DestinationVariable String roomCode,
            @Payload NightActionRequest request,
            Principal principal
    ) {
        MafiaActionCommand command = new MafiaActionCommand(
                roomCode,
                Long.parseLong(principal.getName()),
                request.requestId(),
                request.targetUserId()
        );
        mafiaUseCase.execute(command);
    }

    // 의사 선택
    @MessageMapping("/rooms/{roomCode}/night/doctor/select")
    public void doctorSelect(
            @DestinationVariable String roomCode,
            @Payload NightActionRequest request,
            Principal principal
    ) {
        DoctorActionCommand command = new DoctorActionCommand(
                roomCode,
                Long.parseLong(principal.getName()),
                request.requestId(),
                request.targetUserId()
        );
        doctorUseCase.execute(command);
    }

    // 경찰 선택
    @MessageMapping("/rooms/{roomCode}/night/police/select")
    public void policeSelect(
            @DestinationVariable String roomCode,
            @Payload NightActionRequest request,
            Principal principal
    ) {
        PoliceActionCommand command = new PoliceActionCommand(
                roomCode,
                Long.parseLong(principal.getName()),
                request.requestId(),
                request.targetUserId()
        );
        policeUseCase.execute(command);
    }

    // 밤 정산
    @MessageMapping("/rooms/{roomCode}/night/resolve")
    public void resolve(
            @DestinationVariable String roomCode,
            @Payload NightResolveRequest request,
            Principal principal
    ) {
        NightResolveCommand command = new NightResolveCommand(
                roomCode,
                Long.parseLong(principal.getName()),
                request.requestId()
        );
        resolveUseCase.execute(command);
    }
}