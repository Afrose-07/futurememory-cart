import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('[Supabase] Client initialized successfully.');
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client:', err.message);
  }
} else {
  console.log('[Supabase] Credentials not provided in .env (Storage falling back to persistent local storage).');
}

export const isSupabaseConfigured = () => Boolean(supabase);

/**
 * Upload an image buffer to Supabase Storage
 * @param {Buffer} buffer - Image binary buffer
 * @param {string} fileName - Destination filename
 * @param {string} contentType - image/png or image/jpeg
 * @returns {Promise<string|null>} Public URL or null if failed
 */
export async function uploadImageToSupabase(buffer, fileName, contentType = 'image/png') {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.storage
      .from(storageBucket)
      .upload(fileName, buffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('[Supabase Storage Error]:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(storageBucket)
      .getPublicUrl(fileName);

    return publicUrlData ? publicUrlData.publicUrl : null;
  } catch (err) {
    console.error('[Supabase Storage Exception]:', err.message);
    return null;
  }
}

/**
 * Update product record in Supabase Database (if table exists)
 * @param {string} productId - Unique product ID
 * @param {object} updates - Database fields to update (image, images, etc.)
 * @returns {Promise<boolean>}
 */
export async function updateProductInSupabase(productId, updates) {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);

    if (error) {
      console.warn('[Supabase DB Update Notice]:', error.message);
      return false;
    }

    console.log(`[Supabase DB] Product record ${productId} updated successfully.`);
    return true;
  } catch (err) {
    console.warn('[Supabase DB Exception]:', err.message);
    return false;
  }
}

export default supabase;

