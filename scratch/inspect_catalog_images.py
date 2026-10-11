import re
import json

with open('src/data/allOccasionsCatalog.js', 'r', encoding='utf-8') as f:
    text = f.read()

images = set(re.findall(r'"image":\s*"([^"]+)"', text))
print(f"Total unique images: {len(images)}")

# Check for banned/problematic food photo IDs
banned_ids = [
    'photo-1576092768241-dec231879fc3', # tea cup with teabag
    'photo-1514432324607-a09d9b4aefdd', # coffee froth
    'photo-1544787219-7f47ccb76574', # tea
    'photo-1563729784474-d77dbb933a9e', # cake/food
]

found_banned = []
for img in sorted(images):
    for b in banned_ids:
        if b in img:
            found_banned.append((b, img))

if found_banned:
    print(f"WARNING: Found {len(found_banned)} banned image references:")
    for b, img in found_banned:
        print(f"  Banned {b}: {img}")
else:
    print("SUCCESS: Zero banned tea/coffee/food photos found in allOccasionsCatalog.js!")

print("\nSample of image URLs in catalog:")
for img in sorted(list(images))[:20]:
    print(" ", img)
