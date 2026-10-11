const fs = require('fs');
let c = fs.readFileSync('src/data/allOccasionsCatalog.js', 'utf8');

c += `

export const occasionsMetadata = {
  anniversary: { id: 'anniversary', name: 'Anniversaries', description: 'Gifts for him and her', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  birthday: { id: 'birthday', name: 'Birthdays', description: 'Make their day special', image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84' },
  wedding: { id: 'wedding', name: 'Weddings', description: 'Celebrate the union', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  festival: { id: 'festival', name: 'Festivals', description: 'Joyful celebrations', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  casual: { id: 'casual', name: 'Casual', description: 'Everyday wear and use', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  housewarming: { id: 'housewarming', name: 'Housewarming', description: 'For the new home', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  work: { id: 'work', name: 'Work', description: 'Professional essentials', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  party: { id: 'party', name: 'Party', description: 'Stand out from the crowd', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' }
};
`;

fs.writeFileSync('src/data/allOccasionsCatalog.js', c);
console.log('Fixed exports');
