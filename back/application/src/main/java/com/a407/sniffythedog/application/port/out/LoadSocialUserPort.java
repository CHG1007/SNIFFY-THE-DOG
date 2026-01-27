package com.a407.sniffythedog.application.port.out;

import com.a407.sniffythedog.domain.user.enums.SocialProvider;

public interface LoadSocialUserPort {
    SocialUserInfo loadUser(SocialProvider provider, String accessToken);
}
