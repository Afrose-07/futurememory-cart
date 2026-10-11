import json
import os

OCCASIONS = [
    # -------------------------------------------------------------
    # Group 1: Celebrations & Gifts
    # -------------------------------------------------------------
    {
        "id": "birthday",
        "name": "Birthdays",
        "group": "Celebrations & Gifts",
        "icon": "🎂",
        "description": "Make birthdays unforgettable with personalized gifts, hampers & keepsakes",
        "image": "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80",
        "prefix": "BDY"
    },
    {
        "id": "wedding",
        "name": "Weddings",
        "group": "Celebrations & Gifts",
        "icon": "💍",
        "description": "Luxury wedding presents, dinnerware, home accents & couple hampers",
        "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
        "prefix": "WED"
    },
    {
        "id": "anniversary",
        "name": "Anniversaries",
        "group": "Celebrations & Gifts",
        "icon": "❤️",
        "description": "Heartwarming milestone romantic tokens, watches & couple treasures",
        "image": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&q=80",
        "prefix": "ANN"
    },
    {
        "id": "engagement",
        "name": "Engagements",
        "group": "Celebrations & Gifts",
        "icon": "💎",
        "description": "Celebrate vows and rings with elegant hampers, platters & crystal gifts",
        "image": "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80",
        "prefix": "ENG"
    },
    {
        "id": "valentines",
        "name": "Valentine's Day",
        "group": "Celebrations & Gifts",
        "icon": "🌹",
        "description": "Romantic perfumes, chocolates, plush keepsakes & romantic tokens",
        "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&q=80",
        "prefix": "VAL"
    },
    {
        "id": "friendship",
        "name": "Friendship Day",
        "group": "Celebrations & Gifts",
        "icon": "🤝",
        "description": "Fun band sets, matching mugs, polaroid albums & playful memories",
        "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80",
        "prefix": "FRN"
    },
    {
        "id": "baby_shower",
        "name": "Baby Shower & Naming",
        "group": "Celebrations & Gifts",
        "icon": "🍼",
        "description": "Adorable newborn swaddles, memory casts, silver spoons & nursery care",
        "image": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
        "prefix": "BBY"
    },
    {
        "id": "retirement_farewell",
        "name": "Retirement & Farewell",
        "group": "Celebrations & Gifts",
        "icon": "🌅",
        "description": "Honour career milestones with engraved plaques, pens & executive gifts",
        "image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
        "prefix": "RET"
    },
    {
        "id": "housewarming",
        "name": "Housewarming & New Home",
        "group": "Celebrations & Gifts",
        "icon": "🏡",
        "description": "Aroma diffusers, wall art, dinner sets, indoor plants & cozy decor",
        "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80",
        "prefix": "HSW"
    },
    {
        "id": "achievements",
        "name": "Achievements & Milestones",
        "group": "Celebrations & Gifts",
        "icon": "🏆",
        "description": "Celebrate victories, trophies, exam excellence & proud triumphs",
        "image": "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80",
        "prefix": "ACH"
    },

    # -------------------------------------------------------------
    # Group 2: Festivals & Cultural Events
    # -------------------------------------------------------------
    {
        "id": "pongal",
        "name": "Pongal & Makar Sankranti",
        "group": "Festivals & Cultural Events",
        "icon": "🌾",
        "description": "Traditional brass pots, kolam kits, harvest sweets & festive apparel",
        "image": "https://images.unsplash.com/photo-1610337673044-720471f83677?w=600&q=80",
        "prefix": "PNG"
    },
    {
        "id": "diwali",
        "name": "Diwali Festival",
        "group": "Festivals & Cultural Events",
        "icon": "🪔",
        "description": "Artisan brass diyas, gourmet dry fruits, silver coins & radiant lighting",
        "image": "https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?w=600&q=80",
        "prefix": "DIW"
    },
    {
        "id": "tamil_new_year",
        "name": "Tamil New Year (Puthandu)",
        "group": "Festivals & Cultural Events",
        "icon": "🥭",
        "description": "Kuthu vilakku, mango toran, handloom dhotis & auspicious delicacies",
        "image": "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
        "prefix": "TNY"
    },
    {
        "id": "christmas",
        "name": "Christmas Celebrations",
        "group": "Festivals & Cultural Events",
        "icon": "🎄",
        "description": "Festive plum cakes, gingerbread, tree ornaments, stockings & cozy scents",
        "image": "https://images.unsplash.com/photo-1512474932049-78ac69ede12c?w=600&q=80",
        "prefix": "XMS"
    },
    {
        "id": "eid_ramadan",
        "name": "Eid & Ramadan",
        "group": "Festivals & Cultural Events",
        "icon": "🌙",
        "description": "Gourmet royal dates, crescent lamps, luxury attar & embroidered rugs",
        "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80",
        "prefix": "EID"
    },
    {
        "id": "onam",
        "name": "Onam Festival",
        "group": "Festivals & Cultural Events",
        "icon": "🌼",
        "description": "Kasavu sarees, brass nilavilakku, payasam kits & floral festivity sets",
        "image": "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=600&q=80",
        "prefix": "ONM"
    },
    {
        "id": "holi",
        "name": "Holi Festival of Colors",
        "group": "Festivals & Cultural Events",
        "icon": "🎨",
        "description": "Organic herbal gulal, pichkari sets, thandai hampers & sweet gujiyas",
        "image": "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&q=80",
        "prefix": "HOL"
    },
    {
        "id": "raksha_bandhan",
        "name": "Raksha Bandhan",
        "group": "Festivals & Cultural Events",
        "icon": "🧵",
        "description": "Designer rakhis, roli chawal thalis, sibling chocolate boxes & jewelry",
        "image": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=600&q=80",
        "prefix": "RAK"
    },
    {
        "id": "navratri_ganesh",
        "name": "Navratri & Ganesh Chaturthi",
        "group": "Festivals & Cultural Events",
        "icon": "✨",
        "description": "Clay Ganesha, brass aarti thalis, dandiya sticks & modak gift packs",
        "image": "https://images.unsplash.com/photo-1567591414240-e14b136894c2?w=600&q=80",
        "prefix": "NAV"
    },
    {
        "id": "new_year",
        "name": "New Year Celebrations",
        "group": "Festivals & Cultural Events",
        "icon": "🎉",
        "description": "New Year planners, desk calendars, party accessories & luxury hampers",
        "image": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
        "prefix": "NWY"
    },
    {
        "id": "parents_day",
        "name": "Mother's & Father's Day",
        "group": "Festivals & Cultural Events",
        "icon": "🌸",
        "description": "Thoughtful wellness gifts, memory mugs, leather accessories & love",
        "image": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80",
        "prefix": "PAR"
    },
    {
        "id": "womens_teachers_day",
        "name": "Women's & Teacher's Day",
        "group": "Festivals & Cultural Events",
        "icon": "📚",
        "description": "Desk plaques, premium pen journals, herbal teas & token of gratitude",
        "image": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80",
        "prefix": "WTC"
    },

    # -------------------------------------------------------------
    # Group 3: College & Career
    # -------------------------------------------------------------
    {
        "id": "college_joining",
        "name": "College Joining & Freshers",
        "group": "College & Career",
        "icon": "🎒",
        "description": "Campus backpacks, steel tumblers, desk study sets & dorm essentials",
        "image": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
        "prefix": "CLG"
    },
    {
        "id": "graduation",
        "name": "Graduation & Convocation",
        "group": "College & Career",
        "icon": "🎓",
        "description": "Diploma frames, medal displays, laptop bags & graduate milestone gifts",
        "image": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
        "prefix": "GRD"
    },
    {
        "id": "career_milestone",
        "name": "First Job & Promotion",
        "group": "College & Career",
        "icon": "💼",
        "description": "Leather portfolios, wireless clickers, ties, blazers & executive kits",
        "image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
        "prefix": "CAR"
    },
    {
        "id": "corporate_gifting",
        "name": "Corporate Gifting & Office",
        "group": "College & Career",
        "icon": "🏢",
        "description": "Custom diaries, wireless chargers, gourmet gift boxes & office tokens",
        "image": "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&q=80",
        "prefix": "COR"
    },

    # -------------------------------------------------------------
    # Group 4: Lifestyle & Special Moments
    # -------------------------------------------------------------
    {
        "id": "travel_adventure",
        "name": "Travel, Adventure & Camping",
        "group": "Lifestyle & Special Moments",
        "icon": "✈️",
        "description": "Luggage cubes, passport sleeves, travel flasks, neck pillows & gear",
        "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80",
        "prefix": "TRV"
    },
    {
        "id": "fitness_goals",
        "name": "Fitness Goals & Wellness",
        "group": "Lifestyle & Special Moments",
        "icon": "🏃",
        "description": "Anti-slip yoga mats, shaker bottles, gym bags & smart activity trackers",
        "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        "prefix": "FIT"
    },
    {
        "id": "new_car",
        "name": "New Car & Vehicle Delivery",
        "group": "Lifestyle & Special Moments",
        "icon": "🚗",
        "description": "Car aroma diffusers, key fob cases, tire inflators & trunk organizers",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80",
        "prefix": "NCR"
    },
    {
        "id": "new_business",
        "name": "New Business & Grand Opening",
        "group": "Lifestyle & Special Moments",
        "icon": "🏬",
        "description": "Lucky bamboo, brass laughing buddha, acrylic signs & opening ribbon sets",
        "image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
        "prefix": "NBS"
    },
    {
        "id": "pet_birthday",
        "name": "Pet Birthday & Furry Friends",
        "group": "Lifestyle & Special Moments",
        "icon": "🐾",
        "description": "Birthday bandanas, squeaky chew toys, pet treat hampers & snug beds",
        "image": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80",
        "prefix": "PET"
    },
    {
        "id": "self_care",
        "name": "Self-Care & Spa Pampering",
        "group": "Lifestyle & Special Moments",
        "icon": "🧘",
        "description": "Lavender bath salts, jade face rollers, essential oils & herbal teas",
        "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
        "prefix": "SLC"
    },
    {
        "id": "hobby_gifts",
        "name": "Hobby Gifts & Creativity",
        "group": "Lifestyle & Special Moments",
        "icon": "🎸",
        "description": "Canvas acrylic kits, gardening tools, calligraphy pens & craft sets",
        "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
        "prefix": "HOB"
    },
    {
        "id": "just_because",
        "name": "Just Because & Surprises",
        "group": "Lifestyle & Special Moments",
        "icon": "🎁",
        "description": "Comfort cookie boxes, pocket hug tokens, mini succulents & cozy socks",
        "image": "https://images.unsplash.com/photo-1549465220-1a8b9238cd34?w=600&q=80",
        "prefix": "JBC"
    }
]

print(f"Total occasions defined: {len(OCCASIONS)}")
