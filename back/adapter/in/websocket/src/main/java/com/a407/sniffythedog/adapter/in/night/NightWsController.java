package com.a407.sniffythedog.adapter.in.night;

import com.a407.sniffythedog.adapter.in.night.request.TargetRequest;
import com.a407.sniffythedog.application.night.in.*;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class NightWsController {

    private final MafiaNightUseCase mafia;
    private final DoctorNightUseCase doctor;
    private final PoliceNightUseCase police;
    private final NightResolveUseCase resolve;

    public NightWsController(
            MafiaNightUseCase mafia,
            DoctorNightUseCase doctor,
            PoliceNightUseCase police,
            NightResolveUseCase resolve
    ) {
        this.mafia = mafia;
        this.doctor = doctor;
        this.police = police;
        this.resolve = resolve;
    }
    // 마피아 확정
    @MessageMapping("/rooms/{roomCode}/night/mafia/confirm")
    public void mafiaConfirm(@DestinationVariable String roomCode, TargetRequest req, Principal principal) {
        mafia.selectMafia(roomCode, Long.parseLong(principal.getName()), req.targetUserId());
    }

    // 의사 선택
    @MessageMapping("/rooms/{roomCode}/night/doctor/select")
    public void doctorSelect(@DestinationVariable String roomCode, TargetRequest req, Principal principal) {
        doctor.selectDoctor(roomCode, Long.parseLong(principal.getName()), req.targetUserId());
    }

    // 경찰 선택
    @MessageMapping("/rooms/{roomCode}/night/police/select")
    public void policeSelect(@DestinationVariable String roomCode, TargetRequest req, Principal principal) {
        police.selectPolice(roomCode, Long.parseLong(principal.getName()), req.targetUserId());
    }

    // 밤 정산
    @MessageMapping("/rooms/{roomCode}/night/resolve")
    public void resolve(@DestinationVariable String roomCode) {
        resolve.resolve(roomCode);
    }
}
