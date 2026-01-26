package com.a407.sniffythedog.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
// 헥사고날 구조로 분리된 패키지(Adapter, Domain 등)의 모든 Bean, Repository, Entity를 스캔
@ComponentScan(basePackages = "com.a407.sniffythedog")
public class BootstrapApplication {
	public static void main(String[] args) {
		SpringApplication.run(BootstrapApplication.class, args);
	}
}

