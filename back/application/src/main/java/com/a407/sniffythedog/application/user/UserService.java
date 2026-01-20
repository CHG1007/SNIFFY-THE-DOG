package com.a407.sniffythedog.application.user;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.user.in.ChangeNicknameCommand;
import com.a407.sniffythedog.application.user.in.ChangeNicknameUseCase;
import com.a407.sniffythedog.application.user.in.GetMyInfoResult;
import com.a407.sniffythedog.application.user.in.GetMyInfoUseCase;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.Nickname;
import com.a407.sniffythedog.domain.user.vo.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService implements GetMyInfoUseCase, ChangeNicknameUseCase {

    private final UserPort userPort;

    @Override
    public GetMyInfoResult execute(Long userId) {
        User user = userPort.findById(UserId.of(userId));

        if (user == null) {
            throw ApplicationException.of(ExceptionType.USER_NOT_FOUND);
        }

        return new GetMyInfoResult(
            user.getId().value(),
            user.getNickname().value(),
            user.getSocialProvider().name(),
            user.getRole().name(),
            user.getStatus().name(),
            user.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public GetMyInfoResult execute(ChangeNicknameCommand command) {
        User user = userPort.findById(UserId.of(command.userId()));

        if (user == null) {
            throw ApplicationException.of(ExceptionType.USER_NOT_FOUND);
        }

        Nickname newNickname = Nickname.of(command.newNickname());
        user.changeNickname(newNickname);
        User savedUser = userPort.save(user);

        return new GetMyInfoResult(
            savedUser.getId().value(),
            savedUser.getNickname().value(),
            savedUser.getSocialProvider().name(),
            savedUser.getRole().name(),
            savedUser.getStatus().name(),
            savedUser.getCreatedAt()
        );
    }
}
