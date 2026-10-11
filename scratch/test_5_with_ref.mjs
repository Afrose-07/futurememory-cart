const testItems = [
  "professional studio product photo of maroon bridal lehenga on mannequin neutral studio background",
  "professional studio product photo of personalized ceramic white coffee mug clean background",
  "professional studio product photo of luxury silver analog chronograph watch velvet display",
  "professional studio product photo of matte black noise cancelling wireless earbuds charging case"
];

async function run() {
  for (const item of testItems) {
    const enc = encodeURIComponent(item);
    const url = `https://image.pollinations.ai/prompt/${enc}?width=800&height=800&nologo=true&referrer=futurememory`;
    try {
      const res = await fetch(url, {
        headers: {
          'Referer': 'https://futurememorycart.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      console.log(item.slice(0, 45), '-> Status:', res.status, res.headers.get('content-type'));
    } catch(e) {
      console.log(item.slice(0, 45), '-> Error:', e.message);
    }
  }
}
run();
