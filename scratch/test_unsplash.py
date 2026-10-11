import urllib.request

test_urls = {
    'present_box_1': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd34?w=600&q=80',
    'present_box_2': 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&q=80',
    'greeting_card_1': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80',
    'greeting_card_2': 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=600&q=80',
    'greeting_card_3': 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&q=80',
    'ceramic_mug_clean': 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&q=80',
    'ceramic_mug_white': 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&q=80',
    'white_coffee_mug': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
    'jewellery_box': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'desk_lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
    'photo_frame': 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=600&q=80',
    'watch': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
    'wallet': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80',
    'perfume': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
    'teddy': 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&q=80'
}

for name, url in test_urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            print(f'{name}: OK ({resp.status})')
    except Exception as e:
        print(f'{name}: FAILED ({e})')
