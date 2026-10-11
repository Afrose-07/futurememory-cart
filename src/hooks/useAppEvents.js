import { useEffect, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useWishlist } from '../context/WishlistContext';
import { useMemoryCart } from '../context/MemoryCartContext';
import { allProductsCatalog } from '../data/allOccasionsCatalog';
import { formatPrice } from '../utils/helpers';

export const useAppEvents = () => {
  const { addNotification } = useNotifications();
  const { wishlist } = useWishlist();
  const { memoryItems } = useMemoryCart();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Simulate Wishlist Price Drops & Stock Alerts
    wishlist.forEach(item => {
      const liveProduct = allProductsCatalog.find(p => String(p.id) === String(item.id || item.productId));
      if (!liveProduct) return;
      
      if (liveProduct.price < (item.price || liveProduct.price)) {
        addNotification({
          type: 'price_drop',
          title: 'Price Updated',
          message: `${liveProduct.name} dropped from ${formatPrice(item.price)} to ${formatPrice(liveProduct.price)}!`,
          relatedProductId: liveProduct.id
        });
      }
      
      if (item.stock === 0 && liveProduct.stock > 0) {
        addNotification({
          type: 'stock',
          title: 'Back in Stock',
          message: `${liveProduct.name} is now back in stock at ${formatPrice(liveProduct.price)}!`,
          relatedProductId: liveProduct.id
        });
      }
    });

    if (memoryItems.length > 0) {
      const firstMemoryItem = memoryItems[0];
      addNotification({
        type: 'reminder',
        title: 'Memory Cart Reminder',
        message: `You saved ${firstMemoryItem.name} for a future occasion.`,
        relatedProductId: firstMemoryItem.id || firstMemoryItem.productId
      });
    }

  }, [addNotification, wishlist, memoryItems]);
};
