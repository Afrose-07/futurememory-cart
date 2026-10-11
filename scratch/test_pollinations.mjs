async function test() {
  const prompt = encodeURIComponent("commercial studio product photo of Maroon Lehenga");
  const urls = [
    `https://image.pollinations.ai/prompt/${prompt}?width=600&height=600&nologo=true`,
    `https://image.pollinations.ai/prompt/${prompt}?model=turbo&width=600&height=600&nologo=true`,
    `https://image.pollinations.ai/prompt/${prompt}`
  ];

  for (const u of urls) {
    try {
      const res = await fetch(u);
      console.log(u.slice(0, 70), '-> status:', res.status, res.headers.get('content-type'));
    } catch(e) {
      console.log(u.slice(0, 70), '-> error:', e.message);
    }
  }
}
test();
