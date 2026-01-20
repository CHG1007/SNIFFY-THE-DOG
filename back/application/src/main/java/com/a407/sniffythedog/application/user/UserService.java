package com.a407.sniffythedog.application.user;

import com.a407.sniffythedog.application.common.PageInfo;
import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.user.in.ChangeNicknameCommand;
import com.a407.sniffythedog.application.user.in.ChangeNicknameUseCase;
import com.a407.sniffythedog.application.user.in.GetMyInfoResult;
import com.a407.sniffythedog.application.user.in.GetMyInfoUseCase;
import com.a407.sniffythedog.application.user.in.GetUserGameHistoryQuery;
import com.a407.sniffythedog.application.user.in.GetUserGameHistoryResult;
import com.a407.sniffythedog.application.user.in.GetUserGameHistoryUseCase;
import com.a407.sniffythedog.application.user.out.GameHistoryPage;
import com.a407.sniffythedog.application.user.out.GameHistoryPort;
import com.a407.sniffythedog.application.user.out.UserPort;
import com.a407.sniffythedog.domain.user.entity.User;
import com.a407.sniffythedog.domain.user.vo.Nickname;
import com.a407.sniffythedog.domain.user.vo.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService implements GetMyInfoUseCase, ChangeNicknameUseCase, GetUserGameHistoryUseCase {

    private final UserPort userPort;
    private final GameHistoryPort gameHistoryPort;

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

    @Override
    public GetUserGameHistoryResult execute(GetUserGameHistoryQuery query) {
        User user = userPort.findById(UserId.of(query.userId()));

        if (user == null) {
            throw ApplicationException.of(ExceptionType.USER_NOT_FOUND);
        }

        GameHistoryPage historyPage = gameHistoryPort.findByUserId(
            UserId.of(query.userId()),
            query.page(),
            query.size(),
            query.sortBy(),
            query.sortDirection()
        );

        List<GetUserGameHistoryResult.GameHistoryItem> items = historyPage.content().stream()
            .map(entry -> new GetUserGameHistoryResult.GameHistoryItem(
                entry.gameHistory().getId().value(),
                entry.participant().getJob().name(),
                entry.participant().getResult().name(),
                entry.gameHistory().getWinner().name(),
                entry.participant().isAlive(),
                entry.gameHistory().getStartAt(),
                entry.gameHistory().getEndAt(),
                entry.gameHistory().getPlayTime()
            ))
            .toList();

        PageInfo pageInfo = PageInfo.of(
            historyPage.page(),
            historyPage.size(),
            historyPage.totalElements(),
            historyPage.totalPages()
        );

        return new GetUserGameHistoryResult(items, pageInfo);
    }
}
