// Tamil Nadu Postal Pincode Auto-Detection Engine

// Prefix-to-district/city mapping for Tamil Nadu (600xxx to 643xxx)
const PREFIX_MAP = {
  // Chennai & Surrounds
  '600': { district: 'Chennai', city: 'Chennai' },
  '601': { district: 'Tiruvallur', city: 'Tiruvallur' },
  '602': { district: 'Tiruvallur', city: 'Tiruvallur' },
  '603': { district: 'Chengalpattu', city: 'Chengalpattu' },
  '604': { district: 'Viluppuram', city: 'Tindivanam' },
  '605': { district: 'Viluppuram', city: 'Viluppuram' },
  '606': { district: 'Tiruvannamalai', city: 'Tiruvannamalai' },
  '607': { district: 'Cuddalore', city: 'Cuddalore' },
  '608': { district: 'Cuddalore', city: 'Chidambaram' },
  '609': { district: 'Mayiladuthurai', city: 'Mayiladuthurai' },
  '610': { district: 'Tiruvarur', city: 'Tiruvarur' },
  '611': { district: 'Nagapattinam', city: 'Nagapattinam' },
  '612': { district: 'Thanjavur', city: 'Kumbakonam' },
  '613': { district: 'Thanjavur', city: 'Thanjavur' },
  '614': { district: 'Thanjavur', city: 'Pattukkottai' },
  '620': { district: 'Tiruchirappalli', city: 'Tiruchirappalli' },
  '621': { district: 'Ariyalur / Perambalur', city: 'Ariyalur' },
  '622': { district: 'Pudukkottai', city: 'Pudukkottai' },
  '623': { district: 'Ramanathapuram', city: 'Ramanathapuram' },
  '624': { district: 'Dindigul', city: 'Dindigul' },
  '625': { district: 'Madurai', city: 'Madurai' },
  '626': { district: 'Virudhunagar', city: 'Sivakasi' },
  '627': { district: 'Tenkasi / Tirunelveli', city: 'Tenkasi' },
  '628': { district: 'Thoothukudi', city: 'Thoothukudi' },
  '629': { district: 'Kanniyakumari', city: 'Nagercoil' },
  '630': { district: 'Sivaganga', city: 'Karaikudi' },
  '631': { district: 'Ranipet / Kanchipuram', city: 'Ranipet' },
  '632': { district: 'Vellore', city: 'Vellore' },
  '635': { district: 'Krishnagiri / Dharmapuri', city: 'Hosur' },
  '636': { district: 'Salem', city: 'Salem' },
  '637': { district: 'Namakkal', city: 'Namakkal' },
  '638': { district: 'Erode', city: 'Erode' },
  '639': { district: 'Karur', city: 'Karur' },
  '641': { district: 'Coimbatore', city: 'Coimbatore' },
  '642': { district: 'Coimbatore', city: 'Pollachi' },
  '643': { district: 'Nilgiris', city: 'Ooty' },
};

// Exact mapping for frequent pincodes
const EXACT_PIN_MAP = {
  '627811': { district: 'Tenkasi', city: 'Tenkasi', area: 'KR Nagar / Tenkasi', state: 'Tamil Nadu' },
  '627808': { district: 'Tenkasi', city: 'Surandai', area: 'Surandai', state: 'Tamil Nadu' },
  '627814': { district: 'Tenkasi', city: 'Alangulam', area: 'Alangulam', state: 'Tamil Nadu' },
  '627802': { district: 'Tenkasi', city: 'Ambasamudram', area: 'Ambasamudram', state: 'Tamil Nadu' },
  '627001': { district: 'Tirunelveli', city: 'Tirunelveli', area: 'Tirunelveli Town', state: 'Tamil Nadu' },
  '627002': { district: 'Tirunelveli', city: 'Palayamkottai', area: 'Palayamkottai', state: 'Tamil Nadu' },
  '627007': { district: 'Tirunelveli', city: 'Tirunelveli Junction', area: 'Tirunelveli Junction', state: 'Tamil Nadu' },
  '600001': { district: 'Chennai', city: 'Chennai', area: 'Parrys / George Town', state: 'Tamil Nadu' },
  '600002': { district: 'Chennai', city: 'Chennai', area: 'Mount Road', state: 'Tamil Nadu' },
  '600017': { district: 'Chennai', city: 'Chennai', area: 'T. Nagar', state: 'Tamil Nadu' },
  '600028': { district: 'Chennai', city: 'Chennai', area: 'R.A. Puram', state: 'Tamil Nadu' },
  '600040': { district: 'Chennai', city: 'Chennai', area: 'Anna Nagar', state: 'Tamil Nadu' },
  '600096': { district: 'Chennai', city: 'Chennai', area: 'Perungudi / OMR', state: 'Tamil Nadu' },
  '641001': { district: 'Coimbatore', city: 'Coimbatore', area: 'Gandhipuram', state: 'Tamil Nadu' },
  '641012': { district: 'Coimbatore', city: 'Coimbatore', area: 'R.S. Puram', state: 'Tamil Nadu' },
  '625001': { district: 'Madurai', city: 'Madurai', area: 'Madurai Town', state: 'Tamil Nadu' },
  '625020': { district: 'Madurai', city: 'Madurai', area: 'KK Nagar', state: 'Tamil Nadu' },
  '620001': { district: 'Tiruchirappalli', city: 'Tiruchirappalli', area: 'Cantonment', state: 'Tamil Nadu' },
  '636001': { district: 'Salem', city: 'Salem', area: 'Salem Town', state: 'Tamil Nadu' },
};

/**
 * Synchronous local detection for Tamil Nadu pincodes
 */
export function detectTamilNaduPincode(pincode) {
  const cleanPin = String(pincode || '').trim();
  if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    return null;
  }

  // Exact match check
  if (EXACT_PIN_MAP[cleanPin]) {
    return {
      ...EXACT_PIN_MAP[cleanPin],
      isTamilNadu: true,
      confidence: 'exact'
    };
  }

  // Check 3-digit prefix
  const prefix = cleanPin.substring(0, 3);
  if (PREFIX_MAP[prefix]) {
    return {
      district: PREFIX_MAP[prefix].district,
      city: PREFIX_MAP[prefix].city,
      area: '',
      state: 'Tamil Nadu',
      isTamilNadu: true,
      confidence: 'prefix'
    };
  }

  // General Tamil Nadu check (first two digits 60 - 64)
  const twoDigit = parseInt(cleanPin.substring(0, 2), 10);
  if (twoDigit >= 60 && twoDigit <= 64) {
    return {
      district: 'Tamil Nadu Region',
      city: 'Tamil Nadu',
      area: '',
      state: 'Tamil Nadu',
      isTamilNadu: true,
      confidence: 'zone'
    };
  }

  return null;
}

/**
 * Enhanced async lookup with Postal API fallback
 */
export async function lookupPincode(pincode) {
  const localMatch = detectTamilNaduPincode(pincode);
  
  const cleanPin = String(pincode || '').trim();
  if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
    return null;
  }

  // Try the free Government Postal PIN API with a short 1.5s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        return {
          district: po.District || localMatch?.district || '',
          city: po.Block !== 'NA' ? po.Block : (po.Division !== 'NA' ? po.Division : po.District),
          area: po.Name || '',
          state: po.State || 'Tamil Nadu',
          isTamilNadu: (po.State || '').toLowerCase().includes('tamil nadu'),
          confidence: 'api'
        };
      }
    }
  } catch {
    // If offline or network timeout, localMatch takes over gracefully
  }

  return localMatch;
}
