INSERT INTO users_account (user_id, full_name, email, phone, role)
VALUES
('11111111-1111-1111-1111-111111111111', 'Aarav Sharma', 'aarav@marketpulse.shop', '+919999000001', 'customer'),
('22222222-2222-2222-2222-222222222222', 'Meera Nair', 'meera@marketpulse.shop', '+919999000002', 'customer'),
('33333333-3333-3333-3333-333333333333', 'Admin Ops', 'admin@marketpulse.shop', '+919999000003', 'admin')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO categories (category_id, name, parent_id, slug) VALUES
(1, 'Electronics', NULL, 'electronics'),
(2, 'Mobiles', 1, 'mobiles'),
(3, 'Laptops', 1, 'laptops'),
(4, 'Home & Kitchen', NULL, 'home-kitchen'),
(5, 'Fashion', NULL, 'fashion'),
(6, 'Audio', 1, 'audio'),
(7, 'Wearables', 1, 'wearables')
ON CONFLICT (category_id) DO UPDATE SET
name = EXCLUDED.name,
parent_id = EXCLUDED.parent_id,
slug = EXCLUDED.slug;

SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));

INSERT INTO products (product_id, name, description, brand, price, stock_qty, category_id)
VALUES
('a1111111-1111-1111-1111-111111111111', 'Nova X Pro Smartphone', 'Flagship phone with AMOLED display, 5G support, and all-day battery.', 'Nova', 64999.00, 18, 2),
('a2222222-2222-2222-2222-222222222222', 'PulseBook Air 14', 'Lightweight productivity laptop with Ryzen performance and vivid display.', 'PulseTech', 72999.00, 11, 3),
('a3333333-3333-3333-3333-333333333333', 'EchoBuds Max', 'Noise cancelling wireless earbuds with spatial sound and fast pairing.', 'SonicArc', 8999.00, 42, 6),
('a4444444-4444-4444-4444-444444444444', 'ChefFlow Smart Blender', 'High-speed kitchen blender with app presets and self-clean mode.', 'ChefFlow', 7499.00, 26, 4),
('a5555555-5555-5555-5555-555555555555', 'StrideFit Everyday Sneakers', 'Breathable lightweight sneakers built for city walks and long wear.', 'StrideFit', 3499.00, 35, 5),
('a6666666-6666-6666-6666-666666666666', 'Orbit Watch S2', 'Fitness smartwatch with sleep tracking, GPS, and seven-day battery.', 'Orbit', 11999.00, 24, 7),
('a7777777-7777-7777-7777-777777777777', 'ViewMax 55 4K TV', '55-inch 4K smart TV with HDR support and voice remote.', 'ViewMax', 45999.00, 9, 1),
('a8888888-8888-8888-8888-888888888888', 'Nimbus Stand Mixer', 'Countertop mixer with 6 speed levels for baking and meal prep.', 'Nimbus', 12999.00, 14, 4),
('a9999999-9999-9999-9999-999999999999', 'AeroCarry Cabin Backpack', 'Travel-ready backpack with laptop sleeve, bottle pockets, and anti-theft zip.', 'AeroCarry', 2899.00, 51, 5),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'PulseSound Party Speaker', 'Portable party speaker with bass boost, RGB lighting, and 12-hour battery.', 'PulseSound', 15499.00, 17, 6),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HomeBrew Coffee Machine', 'Compact coffee machine with milk frother and programmable brewing.', 'HomeBrew', 18499.00, 13, 4),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'SkyTab 11', 'Entertainment tablet with stereo speakers, long battery life, and bright display.', 'SkyTab', 22999.00, 19, 1)
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO reviews (review_id, product_id, user_id, rating, body, created_at)
VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 5, 'Super fast and the camera is excellent even in low light.', NOW() - INTERVAL '7 days'),
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 4, 'Great screen and battery life for work and streaming.', NOW() - INTERVAL '4 days'),
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 5, 'Noise cancellation is impressive for the price point.', NOW() - INTERVAL '2 days'),
('b4444444-4444-4444-4444-444444444444', 'a6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 4, 'Tracks workouts accurately and feels premium on the wrist.', NOW() - INTERVAL '1 day')
ON CONFLICT (review_id) DO NOTHING;

INSERT INTO orders (order_id, user_id, status, total_amount, placed_at)
VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'delivered', 73998.00, NOW() - INTERVAL '12 days'),
('c2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'paid', 20998.00, NOW() - INTERVAL '6 days'),
('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'pending', 3499.00, NOW() - INTERVAL '1 day')
ON CONFLICT (order_id, placed_at) DO NOTHING;

INSERT INTO order_items (item_id, order_id, order_placed_at, product_id, qty, unit_price)
SELECT
    'd1111111-1111-1111-1111-111111111111',
    o.order_id,
    o.placed_at,
    'a1111111-1111-1111-1111-111111111111',
    1,
    64999.00
FROM orders o
WHERE o.order_id = 'c1111111-1111-1111-1111-111111111111'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO order_items (item_id, order_id, order_placed_at, product_id, qty, unit_price)
SELECT
    'd2222222-2222-2222-2222-222222222222',
    o.order_id,
    o.placed_at,
    'a3333333-3333-3333-3333-333333333333',
    1,
    8999.00
FROM orders o
WHERE o.order_id = 'c1111111-1111-1111-1111-111111111111'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO order_items (item_id, order_id, order_placed_at, product_id, qty, unit_price)
SELECT
    'd3333333-3333-3333-3333-333333333333',
    o.order_id,
    o.placed_at,
    'a6666666-6666-6666-6666-666666666666',
    1,
    11999.00
FROM orders o
WHERE o.order_id = 'c2222222-2222-2222-2222-222222222222'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO order_items (item_id, order_id, order_placed_at, product_id, qty, unit_price)
SELECT
    'd4444444-4444-4444-4444-444444444444',
    o.order_id,
    o.placed_at,
    'a4444444-4444-4444-4444-444444444444',
    1,
    7499.00
FROM orders o
WHERE o.order_id = 'c2222222-2222-2222-2222-222222222222'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO order_items (item_id, order_id, order_placed_at, product_id, qty, unit_price)
SELECT
    'd5555555-5555-5555-5555-555555555555',
    o.order_id,
    o.placed_at,
    'a5555555-5555-5555-5555-555555555555',
    1,
    3499.00
FROM orders o
WHERE o.order_id = 'c3333333-3333-3333-3333-333333333333'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO payments (payment_id, order_id, order_placed_at, method, status, paid_at)
SELECT
    'e1111111-1111-1111-1111-111111111111',
    o.order_id,
    o.placed_at,
    'card',
    'paid',
    NOW() - INTERVAL '12 days'
FROM orders o
WHERE o.order_id = 'c1111111-1111-1111-1111-111111111111'
ON CONFLICT (payment_id) DO NOTHING;

INSERT INTO payments (payment_id, order_id, order_placed_at, method, status, paid_at)
SELECT
    'e2222222-2222-2222-2222-222222222222',
    o.order_id,
    o.placed_at,
    'upi',
    'paid',
    NOW() - INTERVAL '6 days'
FROM orders o
WHERE o.order_id = 'c2222222-2222-2222-2222-222222222222'
ON CONFLICT (payment_id) DO NOTHING;

INSERT INTO payments (payment_id, order_id, order_placed_at, method, status, paid_at)
SELECT
    'e3333333-3333-3333-3333-333333333333',
    o.order_id,
    o.placed_at,
    'cod',
    'pending',
    NULL
FROM orders o
WHERE o.order_id = 'c3333333-3333-3333-3333-333333333333'
ON CONFLICT (payment_id) DO NOTHING;

INSERT INTO cart (cart_id, user_id, product_id, quantity, added_at)
VALUES
('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 1, NOW() - INTERVAL '2 hours'),
('f2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 2, NOW() - INTERVAL '45 minutes')
ON CONFLICT (cart_id) DO NOTHING;

INSERT INTO user_addresses (
    address_id, user_id, label, recipient_name, phone, line1, city, state, postal_code, country, is_default
)
VALUES
('1111aaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Home', 'Aarav Sharma', '+919999000001', '221 Residency Road', 'Bengaluru', 'Karnataka', '560001', 'India', TRUE),
('2222aaaa-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Office', 'Aarav Sharma', '+919999000001', '14 MG Road Tech Park', 'Bengaluru', 'Karnataka', '560008', 'India', FALSE)
ON CONFLICT (address_id) DO NOTHING;

INSERT INTO wishlist_items (wishlist_id, user_id, product_id)
VALUES
('3333aaaa-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'a6666666-6666-6666-6666-666666666666'),
('4444aaaa-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
ON CONFLICT (wishlist_id) DO NOTHING;

REFRESH MATERIALIZED VIEW mv_category_sales_summary;
