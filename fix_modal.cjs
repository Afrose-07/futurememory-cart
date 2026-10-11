const fs = require('fs');

const modalFile = 'src/components/SettingsModal.jsx';
if (fs.existsSync(modalFile)) {
    let content = fs.readFileSync(modalFile, 'utf8');
    // The diamonds are usually the replacement character \ufffd
    content = content.replace(/\uFFFD/g, ''); 
    // And also remove duplicate question marks if any
    content = content.replace(/ /g, '');
    content = content.replace(/  /g, ' ');
    content = content.replace(/Notification Preference/g, '📬 Notification Preference');
    content = content.replace(/ WhatsApp/g, ' 📱 WhatsApp');
    
    // We don't want multiple emojis if it was already there, but \ufffd is the main issue.
    // Let's just do a clean replace using regex matching the line structure.
    content = content.replace(/<span className="section-title">.*?Notification Preference<\/span>/, '<span className="section-title"> 📬 Notification Preference</span>');
    content = content.replace(/>\s*[\uFFFD\?]*\s*WhatsApp\s*<\/button>/, '> 📱 WhatsApp </button>');
    fs.writeFileSync(modalFile, content);
    console.log('Fixed garbled text in SettingsModal');
}
