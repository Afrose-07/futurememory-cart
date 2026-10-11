import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  discount: {
    type: String,
    default: '15% OFF'
  },
  occasionId: {
    type: String,
    default: 'general'
  },
  occasionName: {
    type: String,
    default: 'Curated Gifts'
  },
  category: {
    type: String,
    default: 'General'
  },
  images: {
    type: [String],
    required: true
  },
  colors: {
    type: [String],
    default: []
  },
  sizes: {
    type: [String],
    default: []
  },
  gender: {
    type: String,
    default: 'Unisex'
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 1
  },
  inStock: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: 'Verified authentic premium quality product with 7-days return policy.'
  },
  is10DaysReturnable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
