-- Mettre à jour les URLs d'images Unsplash invalides avec des URLs valides
UPDATE property_images 
SET image_url = CASE 
  WHEN image_url LIKE '%photo-1754384412601%' THEN 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754384412602%' THEN 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754384412603%' THEN 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754384412604%' THEN 'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754384412605%' THEN 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754384412606%' THEN 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754384412607%' THEN 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754385954515%' THEN 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754386079822%' THEN 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754386079823%' THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754386079824%' THEN 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop'
  WHEN image_url LIKE '%photo-1754386079825%' THEN 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop'
  ELSE image_url
END
WHERE image_url LIKE '%photo-175438%';