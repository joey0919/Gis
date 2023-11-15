-- 격자기준 가운데 부터 point 까지 거리를 잰 후 1km 이내에 있는 point수를 격자를 포함하고 있는 테이블 컬럼에 업데이트
UPDATE yangcheon_grid_result AS a
SET  "1km이내_버스정류장_수" = subquery.cnt
FROM (
    SELECT a.geom, count(b.geom) AS cnt
    FROM "yangcheon_grid_result" a
    LEFT JOIN "국토교통부_전국_버스정류장_위치정보" b
    ON ST_DWithin(ST_Centroid(a.geom), b.geom, 1000)
    GROUP BY a.geom
) AS subquery
WHERE a.geom = subquery.geom;
