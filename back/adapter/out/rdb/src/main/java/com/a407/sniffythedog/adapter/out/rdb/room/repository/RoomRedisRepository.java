package com.a407.sniffythedog.adapter.out.rdb.room.repository;

import com.a407.sniffythedog.adapter.out.rdb.room.entity.RoomEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


public interface RoomRedisRepository extends CrudRepository<RoomEntity, String> {
}
