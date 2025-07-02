import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number").unique(),
  password: varchar("password"), // For email/password login
  role: varchar("role", { enum: ['customer', 'worker', 'admin_umum', 'admin_perusahaan'] }).default('customer'),
  membershipLevel: varchar("membership_level", { enum: ['regular', 'silver', 'gold'] }).default('regular'),
  orderCount: integer("order_count").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default('0'),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Addresses table
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  label: varchar("label").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  details: text("details"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  category: varchar("category", { enum: ['cuci_motor', 'cuci_mobil', 'potong_rumput'] }).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  features: jsonb("features"), // array of features
  addOns: jsonb("add_ons"), // array of add-on services
  images: jsonb("images"), // array of image URLs
  isActive: boolean("is_active").default(true),
  popularityScore: decimal("popularity_score", { precision: 3, scale: 2 }).default('0'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Workers table
export const workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  employeeId: varchar("employee_id").unique().notNull(),
  specializations: jsonb("specializations"), // array of service categories
  availability: varchar("availability", { enum: ['available', 'busy', 'offline', 'on_leave'] }).default('offline'),
  currentLat: decimal("current_lat", { precision: 10, scale: 8 }),
  currentLng: decimal("current_lng", { precision: 11, scale: 8 }),
  lastLocationUpdate: timestamp("last_location_update"),
  totalOrders: integer("total_orders").default(0),
  completedOrders: integer("completed_orders").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default('0'),
  totalRatings: integer("total_ratings").default(0),
  monthlyEarnings: decimal("monthly_earnings", { precision: 10, scale: 2 }).default('0'),
  lifetimeEarnings: decimal("lifetime_earnings", { precision: 10, scale: 2 }).default('0'),
  documents: jsonb("documents"), // verification documents
  equipment: jsonb("equipment"), // tools and vehicle info
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  trackingId: varchar("tracking_id").unique().notNull(),
  customerId: varchar("customer_id").references(() => users.id),
  workerId: integer("worker_id").references(() => workers.id),
  serviceId: integer("service_id").references(() => services.id),
  customerInfo: jsonb("customer_info").notNull(), // name, phone, address, coordinates
  serviceDetails: jsonb("service_details"), // vehicle info, area size, etc.
  scheduledTime: timestamp("scheduled_time").notNull(),
  estimatedDuration: integer("estimated_duration").notNull(),
  priority: varchar("priority", { enum: ['normal', 'express', 'urgent'] }).default('normal'),
  status: varchar("status", { 
    enum: ['pending', 'confirmed', 'assigned', 'ontheway', 'arrived', 'inprogress', 'completed', 'cancelled']
  }).default('pending'),
  paymentMethod: varchar("payment_method", { enum: ['cash', 'qris', 'transfer', 'ewallet', 'cc'] }),
  paymentStatus: varchar("payment_status", { enum: ['pending', 'processing', 'paid', 'failed', 'refunded'] }).default('pending'),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }).default('0'),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  promoCode: varchar("promo_code"),
  transactionId: varchar("transaction_id"),
  paidAt: timestamp("paid_at"),
  timeline: jsonb("timeline"), // status updates with timestamps
  customerRating: jsonb("customer_rating"), // rating from customer
  workerRating: jsonb("worker_rating"), // rating from worker
  cancellationReason: text("cancellation_reason"),
  cancelledBy: varchar("cancelled_by"),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Promotions table
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  code: varchar("code").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type", { enum: ['percentage', 'fixed', 'free_service'] }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  conditions: jsonb("conditions"), // min order, max discount, etc.
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  usageLimit: integer("usage_limit"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations table (for AI chat history)
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").references(() => users.id),
  phoneNumber: varchar("phone_number"),
  channel: varchar("channel", { enum: ['whatsapp', 'web', 'app'] }).default('web'),
  status: varchar("status", { enum: ['active', 'resolved', 'escalated'] }).default('active'),
  assignedAgent: varchar("assigned_agent"),
  messages: jsonb("messages"), // array of message objects
  context: jsonb("context"), // conversation context and extracted data
  escalationReason: text("escalation_reason"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  conversations: many(conversations),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const workersRelations = relations(workers, ({ one, many }) => ({
  user: one(users, {
    fields: [workers.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  worker: one(workers, {
    fields: [orders.workerId],
    references: [workers.id],
  }),
  service: one(services, {
    fields: [orders.serviceId],
    references: [services.id],
  }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  orders: many(orders),
}));

export const conversationsRelations = relations(conversations, ({ one }) => ({
  customer: one(users, {
    fields: [conversations.customerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertWorkerSchema = createInsertSchema(workers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;
export type InsertWorker = z.infer<typeof insertWorkerSchema>;
export type Worker = typeof workers.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
