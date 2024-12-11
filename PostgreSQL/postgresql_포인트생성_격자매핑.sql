-- 위도, 경도를 37, 126 이런식으로 받을때 먼저 ST_SetSRID로 포인트 좌표를 생성
UPDATE "서울특별시_양천구_유흥단란주점_현황"
SET geom = ST_SetSRID(ST_MakePoint("경도", "위도"), 4326)

-- 좌표 생성 후 좌표계 변경 필요시
UPDATE "서울특별시_양천구_유흥단란주점_현황"
SET geom = st_transform(geom, 5186)

--a 가 b 에 포함이 되어있는지 확인하기
SELECT a.geom, b.geom 
FROM  "서울특별시_양천구_유흥단란주점_현황" a left join "인구-가맹점GIS융합정보_양천구" b 
ON st_contains(b.geom, a.geom)

-- 양천구 격자 내에 각각 몇개씩 포인트가 있는지 검사
SELECT a.geom, count(b.geom) AS cnt
FROM "인구-가맹점GIS융합정보_양천구" a LEFT JOIN "서울특별시_양천구_유흥단란주점_현황" b
ON st_contains(a.geom, b.geom)
GROUP BY a.geom

-- 계산한 cnt를 컬럼에 UPDATE
UPDATE "인구-가맹점GIS융합정보_양천구" AS a
SET bar = subquery.cnt
FROM (
    SELECT a.geom, count(b.geom) AS cnt
    FROM "인구-가맹점GIS융합정보_양천구" a
    LEFT JOIN "서울특별시_양천구_유흥단란주점_현황" b
    ON st_contains(a.geom, b.geom)
    GROUP BY a.geom
) AS subquery
WHERE a.geom = subquery.geom;

-- 결과 확인
SELECT bar, geom
FROM "인구-가맹점GIS융합정보_양천구"

-- 2024 추가 -- geocoded_data: 포인트 변환시 위경도를 사용했으면 (127, 37등) 4326 후 5186 이런식으로해야됨
    
UPDATE geocoded_data
SET geom = ST_SetSRID(geom, 4326)
WHERE ST_SRID(geom) = 5186;

UPDATE geocoded_data
SET geom = ST_Transform(geom, 5186)
WHERE ST_SRID(geom) = 4326;
