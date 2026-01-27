package com.a407.sniffythedog.adapter.out.external;

import com.a407.sniffythedog.application.common.exception.ApplicationException;
import com.a407.sniffythedog.application.common.exception.ExceptionType;
import com.a407.sniffythedog.application.port.out.LoadSocialUserPort;
import com.a407.sniffythedog.application.port.out.SocialUserInfo;
import com.a407.sniffythedog.domain.user.enums.SocialProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class KakaoAdapter implements LoadSocialUserPort {

    private static final String KAKAO_REST_API_KEY_HEADER = "X-Kakao-REST-API-KEY";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${kakao.rest-api-key}")
    private String kakaoRestApiKey;

    @Value("${kakao.user-info-url:https://kapi.kakao.com/v2/user/me}")
    private String kakaoUserInfoUrl;

    @Override
    public SocialUserInfo loadUser(SocialProvider provider, String accessToken) {
        if (provider != SocialProvider.KAKAO) {
            throw ApplicationException.of(ExceptionType.BAD_REQUEST, "Unsupported socialType: " + provider);
        }
        if (accessToken == null || accessToken.isBlank()) {
            throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.add(KAKAO_REST_API_KEY_HEADER, kakaoRestApiKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                kakaoUserInfoUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            Map body = response.getBody();
            if (body == null) {
                throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
            }

            Object idValue = body.get("id");
            if (!(idValue instanceof Number idNumber)) {
                throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
            }

            String nickname = extractNickname(body);
            return new SocialUserInfo(String.valueOf(idNumber.longValue()), nickname);
        } catch (RestClientResponseException e) {
            if (e.getRawStatusCode() == 401) {
                throw ApplicationException.of(ExceptionType.INVALID_TOKEN);
            }
            throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
        } catch (RestClientException e) {
            throw ApplicationException.of(ExceptionType.OAUTH_FAILED);
        }
    }

    private String extractNickname(Map body) {
        Object kakaoAccountValue = body.get("kakao_account");
        if (!(kakaoAccountValue instanceof Map<?, ?> kakaoAccount)) {
            return null;
        }

        Object profileValue = kakaoAccount.get("profile");
        if (!(profileValue instanceof Map<?, ?> profile)) {
            return null;
        }

        Object nicknameValue = profile.get("nickname");
        if (nicknameValue instanceof String nickname && !nickname.isBlank()) {
            return nickname;
        }

        return null;
    }
}
