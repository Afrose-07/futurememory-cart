const fs = require('fs');

let orderRoutesCode = fs.readFileSync('server/routes/orderRoutes.js', 'utf8');

orderRoutesCode = orderRoutesCode.replace(
  "import { sendOrderConfirmationWhatsApp } from '../services/whatsappService.js';\\nimport { sendNotification } from '../services/notificationService.js';",
  "import { dispatchNotification } from '../services/notificationService.js';"
);

orderRoutesCode = orderRoutesCode.replace(
  "import { sendOrderConfirmationWhatsApp } from '../services/whatsappService.js';\\r\\nimport { sendNotification } from '../services/notificationService.js';",
  "import { dispatchNotification } from '../services/notificationService.js';"
);

orderRoutesCode = orderRoutesCode.replace(
  "      if (updated) {\\r\\n        return res.json({ success: true, order: updated });\\r\\n      }\\r\\n    }\\r\\n\\r\\n    // In-memory fallback",
  "      if (updated) {\\r\\n        await dispatchNotification(updated, status);\\r\\n        return res.json({ success: true, order: updated });\\r\\n      }\\r\\n    }\\r\\n\\r\\n    // In-memory fallback"
);

orderRoutesCode = orderRoutesCode.replace(
  "    const found = memoryOrders.find(o => o.orderId === id);\\r\\n    return res.json({ success: true, order: found });\\r\\n  } catch (err) {",
  "    const found = memoryOrders.find(o => o.orderId === id);\\r\\n    if (found) await dispatchNotification(found, status);\\r\\n    return res.json({ success: true, order: found });\\r\\n  } catch (err) {"
);

// Mac/Linux line endings
orderRoutesCode = orderRoutesCode.replace(
  "      if (updated) {\\n        return res.json({ success: true, order: updated });\\n      }\\n    }\\n\\n    // In-memory fallback",
  "      if (updated) {\\n        await dispatchNotification(updated, status);\\n        return res.json({ success: true, order: updated });\\n      }\\n    }\\n\\n    // In-memory fallback"
);

orderRoutesCode = orderRoutesCode.replace(
  "    const found = memoryOrders.find(o => o.orderId === id);\\n    return res.json({ success: true, order: found });\\n  } catch (err) {",
  "    const found = memoryOrders.find(o => o.orderId === id);\\n    if (found) await dispatchNotification(found, status);\\n    return res.json({ success: true, order: found });\\n  } catch (err) {"
);

fs.writeFileSync('server/routes/orderRoutes.js', orderRoutesCode);
console.log('Fixed orderRoutes.js successfully.');
