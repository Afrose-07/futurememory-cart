import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const token = process.env.HF_TOKEN;
const hf = new HfInference(token);

const candidates = [
  'prompthero/openjourney',
  'CompVis/stable-diffusion-v1-4',
  'stabilityai/stable-diffusion-2-1-base',
  'segmind/SSD-1B',
  'dataautogpt3/FLUX.1-schnell-gguf'
];

async function run() {
  for (const m of candidates) {
    try {
      console.log('Testing', m);
      const blob = await hf.textToImage({
        model: m,
        inputs: 'formal shirt'
      });
      console.log('✅ Success for', m);
    } catch(e) {
      console.log('❌ Error for', m, ':', e.message);
    }
  }
}
run();
