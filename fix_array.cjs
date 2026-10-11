const fs = require('fs');
let c = fs.readFileSync('src/data/allOccasionsCatalog.js', 'utf8');

c = c.replace(/export const occasionsMetadata = {[\s\S]*?};/, `export const occasionsMetadata = [
  { id: 'anniversary', name: 'Anniversaries', description: 'Gifts for him and her', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'birthday', name: 'Birthdays', description: 'Make their day special', image: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84' },
  { id: 'wedding', name: 'Weddings', description: 'Celebrate the union', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'festival', name: 'Festivals', description: 'Joyful celebrations', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'casual', name: 'Casual', description: 'Everyday wear and use', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'housewarming', name: 'Housewarming', description: 'For the new home', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'work', name: 'Work', description: 'Professional essentials', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' },
  { id: 'party', name: 'Party', description: 'Stand out from the crowd', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc' }
];`);

fs.writeFileSync('src/data/allOccasionsCatalog.js', c);
console.log('Fixed occasionsMetadata to be an Array');
