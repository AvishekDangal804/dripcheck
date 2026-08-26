-- Optional sample data so Discover isn't empty on a fresh Supabase project.
-- image_url uses the "placeholder:<seed>" scheme — components/discover/
-- OutfitCard.tsx renders these as a generated EditorialVisual instead of an
-- <img>, since these entries have no real photo. Real fit-check submissions
-- always carry an actual storage URL here instead.

insert into outfits (name, image_url, score, style, description) values
  ('Clean Streetwear', 'placeholder:streetwear', 9.1, 'Streetwear',
   'Oversized neutral tee, relaxed trousers, and white sneakers keep this look sharp without trying hard.'),
  ('Old Money Morning', 'placeholder:old-money', 8.9, 'Old Money',
   'A knit polo and tailored chinos read effortless and put-together in equal measure.'),
  ('Minimal Monochrome', 'placeholder:simple', 8.7, 'Simple',
   'One tone, clean lines. Proof that restraint is its own kind of statement.'),
  ('Campus Formal', 'placeholder:formal', 8.6, 'Formal',
   'A structured blazer over a plain shirt makes a presentation-ready fit that still feels like you.'),
  ('Everyday Casual', 'placeholder:casual', 8.4, 'Casual',
   'Denim and a soft overshirt — comfortable enough for a full day of classes, styled enough to notice.');
