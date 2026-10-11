async function testHF(model, prompt) {
  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt })
    });
    console.log(`Model ${model} -> Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response preview: ${text.slice(0, 150)}`);
  } catch(e) {
    console.log(`Model ${model} Error: ${e.message}`, e.cause);
  }
}

async function run() {
  await testHF('black-forest-labs/FLUX.1-schnell', 'a blue formal shirt');
}
run();
