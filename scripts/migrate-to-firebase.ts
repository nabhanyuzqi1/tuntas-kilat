import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

// Firebase Admin configuration for migration
const adminApp = initializeApp({
  projectId: "tuntas-kilat",
  // In production, use service account key
}, "migration");

const firestore = getFirestore(adminApp);
const realtimeDb = getDatabase(adminApp);

interface MigrationStats {
  users: number;
  services: number;
  workers: number;
  orders: number;
  promotions: number;
  errors: string[];
}

class FirebaseMigration {
  private stats: MigrationStats = {
    users: 0,
    services: 0,
    workers: 0,
    orders: 0,
    promotions: 0,
    errors: [],
  };

  async setupInitialData(): Promise<void> {
    console.log("Setting up initial Firebase data...");

    // Create sample users
    const initialUsers = [
      {
        id: "demo-customer",
        email: "customer@tuntaskilat.com",
        firstName: "Demo",
        lastName: "Customer",
        role: "customer",
      },
      {
        id: "demo-worker",
        email: "worker@tuntaskilat.com",
        firstName: "Demo",
        lastName: "Worker",
        role: "worker",
      },
      {
        id: "demo-admin",
        email: "admin@tuntaskilat.com",
        firstName: "Admin",
        lastName: "System",
        role: "admin_umum",
      },
    ];

    for (const user of initialUsers) {
      try {
        await firestore.collection("users").doc(user.id).set({
          ...user,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        this.stats.users++;
      } catch (error) {
        this.stats.errors.push(`User ${user.id}: ${error}`);
      }
    }

    // Create services
    const initialServices = [
      {
        name: "Cuci Mobil Regular",
        description: "Layanan cuci mobil standar dengan shampo dan wax",
        category: "car_wash",
        basePrice: 25000,
        duration: 45,
        features: ["Cuci exterior", "Vacuum interior", "Wax basic"],
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76c7d315",
      },
      {
        name: "Cuci Motor Express",
        description: "Cuci motor cepat dan bersih",
        category: "motorcycle_wash",
        basePrice: 15000,
        duration: 30,
        features: ["Cuci menyeluruh", "Lap kering", "Poles jok"],
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76c7d315",
      },
      {
        name: "Potong Rumput Premium",
        description: "Perawatan taman dan potong rumput profesional",
        category: "lawn_mowing",
        basePrice: 50000,
        duration: 90,
        features: ["Potong rumput", "Rapikan tanaman", "Bersihkan area"],
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b",
      },
    ];

    for (const service of initialServices) {
      try {
        await firestore.collection("services").add({
          ...service,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        this.stats.services++;
      } catch (error) {
        this.stats.errors.push(`Service ${service.name}: ${error}`);
      }
    }

    // Create sample workers
    const initialWorkers = [
      {
        userId: "demo-worker",
        employeeId: "TK001",
        name: "Ahmad Supriadi",
        phone: "+6281234567890",
        email: "ahmad@tuntaskilat.com",
        specializations: ["car_wash", "motorcycle_wash"],
        availability: "available",
        location: new GeoPoint(-6.2088, 106.8456),
        averageRating: 4.8,
        totalJobs: 150,
        joinDate: Timestamp.fromDate(new Date("2024-01-15")),
        emergencyContact: "+6281234567891",
        equipment: ["pressure_washer", "vacuum_cleaner", "wax_kit"],
      },
      {
        userId: "demo-worker-2",
        employeeId: "TK002",
        name: "Budi Santoso",
        phone: "+6281234567892",
        email: "budi@tuntaskilat.com",
        specializations: ["lawn_mowing", "gardening"],
        availability: "available",
        location: new GeoPoint(-6.2000, 106.8500),
        averageRating: 4.9,
        totalJobs: 85,
        joinDate: Timestamp.fromDate(new Date("2024-02-01")),
        emergencyContact: "+6281234567893",
        equipment: ["lawn_mower", "hedge_trimmer", "garden_tools"],
      },
    ];

    for (const worker of initialWorkers) {
      try {
        await firestore.collection("workers").add({
          ...worker,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        this.stats.workers++;
      } catch (error) {
        this.stats.errors.push(`Worker ${worker.name}: ${error}`);
      }
    }

    // Create promotions
    const initialPromotions = [
      {
        code: "NEWUSER",
        description: "Diskon 20% untuk pengguna baru",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 0,
        maxDiscount: 50000,
        validFrom: Timestamp.now(),
        validUntil: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        maxUsage: 1000,
        currentUsage: 0,
        active: true,
      },
      {
        code: "WEEKEND50",
        description: "Potongan Rp 50.000 untuk weekend",
        discountType: "fixed",
        discountValue: 50000,
        minOrderValue: 100000,
        maxDiscount: 50000,
        validFrom: Timestamp.now(),
        validUntil: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        maxUsage: 500,
        currentUsage: 0,
        active: true,
      },
    ];

    for (const promotion of initialPromotions) {
      try {
        await firestore.collection("promotions").add({
          ...promotion,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        this.stats.promotions++;
      } catch (error) {
        this.stats.errors.push(`Promotion ${promotion.code}: ${error}`);
      }
    }
  }

  async runMigration(): Promise<void> {
    console.log("Starting Firebase migration...");
    
    try {
      await this.setupInitialData();

      console.log("\n=== Migration Complete ===");
      console.log(`Users created: ${this.stats.users}`);
      console.log(`Services created: ${this.stats.services}`);
      console.log(`Workers created: ${this.stats.workers}`);
      console.log(`Promotions created: ${this.stats.promotions}`);
      
      if (this.stats.errors.length > 0) {
        console.log("\nErrors encountered:");
        this.stats.errors.forEach(error => console.log(`- ${error}`));
      }

    } catch (error) {
      console.error("Migration failed:", error);
    }
  }
}

export { FirebaseMigration };