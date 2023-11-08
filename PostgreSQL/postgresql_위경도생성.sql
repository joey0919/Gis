-- geometry center 값으로 위도, 경도 구하기
SELECT 
  ST_X(st_transform(center, 4326)),
	ST_Y(st_transform(center, 4326))
FROM TABLE
