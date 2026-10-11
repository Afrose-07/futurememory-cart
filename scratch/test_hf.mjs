import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const token = process.env.HF_TOKEN;
console.log('Token defined?', Boolean(token));

const hf = new HfInference(token || 'dummy_token');
console.log('HfInference instance created successfully.');
