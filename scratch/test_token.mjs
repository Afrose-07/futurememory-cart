import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const token = process.env.HF_TOKEN;
console.log('Token starts with:', token ? token.slice(0, 7) + '...' : 'none');

const hf = new HfInference(token);

async function testModel(modelName) {
  console.log(`\nTesting model: ${modelName}...`);
  try {
    const blob = await hf.textToImage({
      model: modelName,
      inputs: 'Professional Amazon commercial product photograph of Sky Blue Formal Shirt on mannequin, studio lighting',
      parameters: {
        negative_prompt: 'blurry, deformed, low quality'
      }
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    console.log(`✅ Success for ${modelName}! Received image of size: ${buffer.length} bytes, type: ${blob.type}`);
    return { success: true, size: buffer.length };
  } catch (err) {
    console.log(`❌ Error for ${modelName}:`, err.message);
    if (err.response) {
      console.log('Response status:', err.response.status);
    }
    return { success: false, error: err.message };
  }
}

async function run() {
  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
    'runwayml/stable-diffusion-v1-5'
  ];

  for (const m of models) {
    const res = await testModel(m);
    if (res.success) {
      console.log(`\n🎉 Verified working model: ${m}`);
      break;
    }
  }
}

run();
