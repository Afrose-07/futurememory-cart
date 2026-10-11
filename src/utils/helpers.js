export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(Number(price))) return '₹0';
  return `₹${Number(price).toLocaleString('en-IN')}`;
};

export const formatColorName = (c) => {
  if (!c) return '';
  if (typeof c === 'object') return c.name || c.label || '';
  return String(c);
};

export const formatSizeName = (s) => {
  if (!s) return '';
  if (typeof s === 'object') return s.name || s.label || '';
  return String(s);
};

export const calculateDiscount = (original, current) => {
  if (!original || !current || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

export const getOccasionRecommendations = (occasion, productsList) => {
  if (!occasion || !productsList) return [];
  return productsList.filter(product => 
    product.occasionTags && product.occasionTags.some(tag => tag.toLowerCase() === occasion.toLowerCase())
  );
};

export const getNextReminderDate = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + parseInt(months, 10));
  return date.toISOString();
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const getDaysRemaining = (targetDateString) => {
  if (!targetDateString) return 0;
  const target = new Date(targetDateString);
  const now = new Date();
  const diffTime = target - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isReminderDue = (reminderDate) => {
  if (!reminderDate) return false;
  const now = new Date();
  return new Date(reminderDate) <= now;
};

export const getRandomDeliveryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3 + Math.floor(Math.random() * 4));
  return date.toISOString();
};

export const getOrderId = () => {
  return 'FM-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
};
