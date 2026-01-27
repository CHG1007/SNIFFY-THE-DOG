package com.a407.sniffythedog.adapter.out.rdb.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.a407.sniffythedog.adapter.out.rdb")
@EntityScan(basePackages = "com.a407.sniffythedog.adapter.out.rdb")
public class RdbConfig {
}
