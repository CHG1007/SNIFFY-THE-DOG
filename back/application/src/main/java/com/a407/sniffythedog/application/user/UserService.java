package com.a407.sniffythedog.application.user;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.user.in.GetMyInfoResult;
import com.a407.sniffythedog.application.user.in.GetMyInfoUseCase;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.UserId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService implements GetMyInfoUseCase {

    private final UserPort userPort;

    public UserService(UserPort userPort) {
        this.userPort = userPort;
    }

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
}