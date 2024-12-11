-- 중첩 면적 확인
SELECT 
    g.id AS grid_id,
    SUM(ST_Area(ST_Intersection(g.geom, b.geom))) AS intersected_area
FROM 
    result_2024 g
JOIN 
    "01.상가-건물 융합데이터_천안시" b
ON 
    ST_Intersects(g.geom, b.geom)
GROUP BY 
    g.id
ORDER BY 
    g.id;


-- 먄적 업데이트 m^2
UPDATE result_2024
SET area = subquery.intersected_area
FROM (
    SELECT 
        g.id AS grid_id,
        SUM(ST_Area(ST_Intersection(g.geom, b.geom))) AS intersected_area
    FROM 
        result_2024 g
    JOIN 
        "01.상가-건물 융합데이터_천안시" b
    ON 
        ST_Intersects(g.geom, b.geom)
    GROUP BY 
        g.id
) AS subquery
WHERE result_2024.id = subquery.grid_id;
