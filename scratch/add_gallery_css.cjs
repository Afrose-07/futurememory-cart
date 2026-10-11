const fs = require('fs');
let code = fs.readFileSync('src/pages/ProductDetailsPage.css', 'utf8');

const galleryCss = `
.fm-gallery-thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
.fm-thumbnail-btn {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: none;
  width: 70px;
  height: 70px;
  transition: all 0.2s;
  position: relative;
}
.fm-thumbnail-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fm-thumbnail-btn.active {
  border-color: #4f46e5;
}
.fm-thumbnail-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-size: 0.65rem;
  padding: 2px 0;
  text-align: center;
}
`;

if (!code.includes('.fm-gallery-thumbnails')) {
  fs.appendFileSync('src/pages/ProductDetailsPage.css', '\n' + galleryCss);
}
console.log('CSS added');
