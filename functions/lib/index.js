"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.generateDailyAnalytics = exports.processPendingOrders = exports.processChatMessage = exports.autoAssignOrder = exports.updateWorkerLocation = exports.onOrderStatusChange = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
const cors = __importStar(require("cors"));
const express = __importStar(require("express"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
const realtimeDb = admin.database();
// Initialize Gemini AI
const genAI = new genai_1.GoogleGenAI(functions.config().gemini.api_key);
// Express app for HTTP functions
const app = express();
app.use(cors({ origin: true }));
// Order status change trigger
exports.onOrderStatusChange = functions.firestore
    .document("orders/{orderId}")
    .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const orderId = context.params.orderId;
    // If status changed, send notifications
    if (beforeData.status !== afterData.status) {
        const notifications = [];
        // Notify customer
        if (afterData.customerId) {
            notifications.push({
                userId: afterData.customerId,
                title: "Status Pesanan Diperbarui",
                body: `Pesanan ${afterData.trackingId} sekarang ${getStatusMessage(afterData.status)}`,
                data: {
                    orderId,
                    status: afterData.status,
                    trackingId: afterData.trackingId,
                },
            });
        }
        // Notify worker if assigned
        if (afterData.workerId) {
            const workerDoc = await db.collection("workers").doc(afterData.workerId).get();
            const workerData = workerDoc.data();
            if (workerData === null || workerData === void 0 ? void 0 : workerData.userId) {
                notifications.push({
                    userId: workerData.userId,
                    title: "Update Tugas",
                    body: `Pesanan ${afterData.trackingId}: ${getStatusMessage(afterData.status)}`,
                    data: {
                        orderId,
                        status: afterData.status,
                        trackingId: afterData.trackingId,
                    },
                });
            }
        }
        // Send notifications
        for (const notification of notifications) {
            await sendPushNotification(notification);
            await saveNotificationToDb(notification);
        }
        // Update real-time tracking
        await realtimeDb.ref(`tracking/${afterData.trackingId}`).update({
            status: afterData.status,
            lastUpdate: admin.firestore.FieldValue.serverTimestamp(),
            timeline: afterData.timeline || [],
        });
    }
    return null;
});
// Worker location tracking
exports.updateWorkerLocation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { lat, lng, accuracy } = data;
    const userId = context.auth.uid;
    // Get worker document
    const workerQuery = await db.collection("workers").where("userId", "==", userId).get();
    if (workerQuery.empty) {
        throw new functions.https.HttpsError("not-found", "Worker not found");
    }
    const workerDoc = workerQuery.docs[0];
    const workerId = workerDoc.id;
    // Update worker location
    await db.collection("workers").doc(workerId).update({
        location: new admin.firestore.GeoPoint(lat, lng),
        locationAccuracy: accuracy,
        lastLocationUpdate: admin.firestore.FieldValue.serverTimestamp(),
    });
    // Update real-time location
    await realtimeDb.ref(`workers/${workerId}/location`).set({
        lat,
        lng,
        accuracy,
        timestamp: Date.now(),
    });
    return { success: true };
});
// Intelligent order assignment
exports.autoAssignOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { orderId } = data;
    try {
        const orderDoc = await db.collection("orders").doc(orderId).get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Order not found");
        }
        const orderData = orderDoc.data();
        // Get available workers
        const workersQuery = await db.collection("workers")
            .where("availability", "==", "available")
            .get();
        if (workersQuery.empty) {
            return { success: false, message: "No available workers" };
        }
        // Score and select best worker
        const workers = workersQuery.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const bestWorker = await findBestWorker(workers, orderData);
        if (bestWorker) {
            // Assign order
            await db.collection("orders").doc(orderId).update({
                workerId: bestWorker.id,
                status: "assigned",
                assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Update worker status
            await db.collection("workers").doc(bestWorker.id).update({
                availability: "busy",
            });
            return { success: true, workerId: bestWorker.id };
        }
        return { success: false, message: "No suitable worker found" };
    }
    catch (error) {
        console.error("Auto-assignment error:", error);
        throw new functions.https.HttpsError("internal", "Assignment failed");
    }
});
// AI Chatbot function
exports.processChatMessage = functions.https.onCall(async (data, context) => {
    const { message, conversationId } = data;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
Anda adalah asisten AI untuk "Tuntas Kilat", platform layanan on-demand yang menyediakan:
- Cuci mobil (mulai dari Rp 25.000)
- Cuci motor (mulai dari Rp 15.000) 
- Potong rumput (mulai dari Rp 50.000)

Respons dalam bahasa Indonesia yang ramah dan membantu. Jika customer menanyakan tentang:
1. Harga - berikan range harga di atas
2. Booking - arahkan ke aplikasi atau WhatsApp
3. Status pesanan - minta tracking ID
4. Layanan - jelaskan layanan yang tersedia

Pesan customer: "${message}"

Berikan respons JSON dengan format:
{
  "message": "respons Anda",
  "quickReplies": ["opsi1", "opsi2"],
  "bookingAction": {
    "type": "view_services" | "start_booking" | "check_order",
    "data": {}
  }
}
`;
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            },
        });
        const response = result.response;
        const aiResponse = JSON.parse(response.text());
        // Save conversation
        if (conversationId) {
            await db.collection("conversations").doc(conversationId).update({
                messages: admin.firestore.FieldValue.arrayUnion({
                    id: Date.now().toString(),
                    sender: "customer",
                    content: message,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                }, {
                    id: (Date.now() + 1).toString(),
                    sender: "ai",
                    content: aiResponse.message,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    quickReplies: aiResponse.quickReplies,
                    bookingAction: aiResponse.bookingAction,
                }),
                lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return aiResponse;
    }
    catch (error) {
        console.error("Chatbot error:", error);
        return {
            message: "Maaf, saya mengalami gangguan. Silakan coba lagi atau hubungi customer service kami.",
            quickReplies: ["Hubungi CS", "Coba Lagi"],
        };
    }
});
// Scheduled function to process pending orders
exports.processPendingOrders = functions.pubsub
    .schedule("every 5 minutes")
    .onRun(async (context) => {
    const pendingOrdersQuery = await db.collection("orders")
        .where("status", "==", "confirmed")
        .where("workerId", "==", null)
        .limit(10)
        .get();
    for (const orderDoc of pendingOrdersQuery.docs) {
        try {
            await (0, exports.autoAssignOrder)({ orderId: orderDoc.id }, { auth: { uid: "system" } });
        }
        catch (error) {
            console.error(`Failed to assign order ${orderDoc.id}:`, error);
        }
    }
    return null;
});
// Analytics aggregation
exports.generateDailyAnalytics = functions.pubsub
    .schedule("0 1 * * *") // Run at 1 AM daily
    .timeZone("Asia/Jakarta")
    .onRun(async (context) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    // Get orders from yesterday
    const ordersQuery = await db.collection("orders")
        .where("createdAt", ">=", yesterday)
        .where("createdAt", "<", today)
        .get();
    const analytics = {
        date: yesterday.toISOString().split('T')[0],
        totalOrders: ordersQuery.size,
        completedOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        serviceBreakdown: {},
    };
    ordersQuery.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === "completed") {
            analytics.completedOrders++;
            analytics.totalRevenue += parseFloat(data.finalAmount || "0");
        }
        const serviceId = data.serviceId;
        analytics.serviceBreakdown[serviceId] = (analytics.serviceBreakdown[serviceId] || 0) + 1;
    });
    analytics.averageOrderValue = analytics.totalRevenue / (analytics.completedOrders || 1);
    // Save analytics
    await db.collection("analytics").doc(analytics.date).set(analytics);
    return null;
});
// Helper functions
function getStatusMessage(status) {
    const messages = {
        pending: "menunggu konfirmasi",
        confirmed: "dikonfirmasi",
        assigned: "telah di-assign ke teknisi",
        in_progress: "sedang dikerjakan",
        completed: "selesai",
        cancelled: "dibatalkan",
    };
    return messages[status] || status;
}
async function sendPushNotification(notification) {
    // Implementation would depend on your push notification service
    // For now, we'll save to real-time database for web notifications
    await realtimeDb.ref(`notifications/${notification.userId}`).push(Object.assign(Object.assign({}, notification), { timestamp: Date.now(), read: false }));
}
async function saveNotificationToDb(notification) {
    await db.collection("notifications").add(Object.assign(Object.assign({}, notification), { createdAt: admin.firestore.FieldValue.serverTimestamp(), read: false }));
}
async function findBestWorker(workers, orderData) {
    var _a, _b;
    // Implement intelligent scoring algorithm
    const customerLocation = (_a = orderData.customerInfo) === null || _a === void 0 ? void 0 : _a.location;
    if (!customerLocation) {
        return workers[0]; // Fallback to first available worker
    }
    let bestWorker = null;
    let bestScore = -1;
    for (const worker of workers) {
        let score = 0;
        // Distance score (closer is better)
        if (worker.location) {
            const distance = calculateDistance(customerLocation.lat, customerLocation.lng, worker.location._latitude, worker.location._longitude);
            score += Math.max(0, 100 - distance); // Max 100 points for distance
        }
        // Rating score
        score += (worker.averageRating || 4) * 20; // Max 100 points for 5-star rating
        // Specialization score
        if (worker.specializations && Array.isArray(worker.specializations)) {
            const serviceDoc = await db.collection("services").doc(orderData.serviceId).get();
            const serviceCategory = (_b = serviceDoc.data()) === null || _b === void 0 ? void 0 : _b.category;
            if (worker.specializations.includes(serviceCategory)) {
                score += 50; // Bonus for specialization match
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestWorker = worker;
        }
    }
    return bestWorker;
}
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// Export the Express app as an HTTP function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map