// Migration V1: create useful indexes (sample)

db = db.getSiblingDB('bookingDB');

// Example: ensure index on orders collection
if (!db.order.getIndexes().some(i => i.name === 'idx_order_status')) {
    db.order.createIndex({ status: 1 }, { name: 'idx_order_status' });
}
