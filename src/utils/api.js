const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Universal API request wrapper with graceful fallback handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // If backend server is offline or unreachable, return null so caller can fallback to local state
    console.warn(`[API] "${endpoint}" unreachable:`, err.message);
    return null;
  }
}

// Admin APIs
export async function apiAdminLogin(email, password) {
  return await apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

// Products APIs
export async function apiGetProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(`/products${query ? `?${query}` : ''}`);
}

export async function apiCreateProduct(productData) {
  return await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

export async function apiUpdateProduct(id, updates) {
  return await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

// Orders APIs
export async function apiGetOrders() {
  return await apiRequest('/orders');
}

export async function apiCreateOrder(orderData) {
  return await apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

export async function apiUpdateOrderStatus(orderId, status) {
  return await apiRequest(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export async function apiProcessReturn(orderId, action, returnDetails = {}) {
  return await apiRequest(`/orders/${orderId}/return`, {
    method: 'PUT',
    body: JSON.stringify({ action, returnDetails })
  });
}

// Notification & Real Email APIs
export async function apiActivateChannel(channel, email, name) {
  return await apiRequest('/users/activate-channel', {
    method: 'POST',
    body: JSON.stringify({ channel, email, name })
  });
}

export async function apiResendOrderEmail(orderId, email) {
  return await apiRequest(`/orders/${orderId}/resend-email`, {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export async function apiSendOrderEmail(orderData) {
  return await apiRequest('/orders/send-email', {
    method: 'POST',
    body: JSON.stringify(orderData)
  });
}

export async function apiTestEmail(email, name) {
  return await apiRequest('/auth/notify-login', {
    method: 'POST',
    body: JSON.stringify({ email, name })
  });
}

