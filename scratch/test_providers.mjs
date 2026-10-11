import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const token = process.env.HF_TOKEN;
const hf = new HfInference(token);

async function testProvider(modelName, provider) {
  console.log(`\nTesting ${modelName} with provider: ${provider}...`);
  try {
    const blob = await hf.textToImage({
      model: modelName,
      inputs: 'a blue shirt',
      provider: provider
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    console.log(`✅ Success! Received ${buffer.length} bytes`);
    return true;
  } catch(e) {
    console.log(`❌ Error (${provider}):`, e.message);
    return false;
  }
}

async function run() {
  const providers = ['hf-inference', 'together', 'replicate', 'hyperbolic', 'sambanova', 'novita'];
  const models = ['black-forest-labs/FLUX.1-schnell', 'stabilityai/stable-diffusion-xl-base-1.0', 'stabilityai/stable-diffusion-2-1'];

  for (const m of models) {
    for (const p of providers) {
      await testProvider(m, p);
    }
  }
}
run();
