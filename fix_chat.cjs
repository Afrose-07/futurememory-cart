const fs = require('fs');

let chatCode = fs.readFileSync('src/components/Chatbot.jsx', 'utf8');

chatCode = chatCode.replace(/à®¤à®®à®¿à®´à¯\s*/g, 'தமிழ்');

fs.writeFileSync('src/components/Chatbot.jsx', chatCode);
console.log('Fixed garbled Tamil text in Chatbot.');
