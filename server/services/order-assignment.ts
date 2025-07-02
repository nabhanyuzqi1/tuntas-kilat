import { storage } from '../storage';
import type { Worker, Order, Service } from '@shared/schema';

interface AssignmentScore {
  workerId: number;
  score: number;
  distance: number;
  availability: string;
  specialization: string[];
  rating: number;
  reason: string;
}

interface OrderAssignmentRequest {
  orderId: number;
  serviceId: number;
  customerLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  urgency: 'low' | 'medium' | 'high';
  scheduledTime?: Date;
}

export class OrderAssignmentService {
  // Main function to assign optimal worker to an order
  async assignOptimalWorker(request: OrderAssignmentRequest): Promise<Worker | null> {
    try {
      // Get service details
      const service = await storage.getService(request.serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      // Get available workers
      const availableWorkers = await storage.getAvailableWorkers(service.category);
      
      if (availableWorkers.length === 0) {
        return null; // No available workers
      }

      // Score and rank workers
      const scoredWorkers = await this.scoreWorkers(
        availableWorkers,
        request,
        service
      );

      // Sort by score (highest first)
      scoredWorkers.sort((a, b) => b.score - a.score);

      // Get the best worker
      const bestWorker = scoredWorkers[0];
      if (bestWorker.score < 0.3) {
        return null; // No suitable worker found
      }

      // Assign the order
      const worker = availableWorkers.find(w => w.id === bestWorker.workerId);
      if (worker) {
        await this.assignOrderToWorker(request.orderId, worker.id, bestWorker.reason);
        return worker;
      }

      return null;
    } catch (error) {
      console.error('Order assignment error:', error);
      return null;
    }
  }

  // Score workers based on multiple criteria
  private async scoreWorkers(
    workers: Worker[],
    request: OrderAssignmentRequest,
    service: Service
  ): Promise<AssignmentScore[]> {
    const scores: AssignmentScore[] = [];

    for (const worker of workers) {
      const score = await this.calculateWorkerScore(worker, request, service);
      scores.push(score);
    }

    return scores;
  }

  // Calculate individual worker score
  private async calculateWorkerScore(
    worker: Worker,
    request: OrderAssignmentRequest,
    service: Service
  ): Promise<AssignmentScore> {
    let totalScore = 0;
    let reason = '';
    const factors: string[] = [];

    // 1. Distance score (40% weight)
    const distance = this.calculateDistance(
      worker.currentLat || 0,
      worker.currentLng || 0,
      request.customerLocation.lat,
      request.customerLocation.lng
    );
    
    const distanceScore = this.getDistanceScore(distance);
    totalScore += distanceScore * 0.4;
    factors.push(`Distance: ${distance.toFixed(1)}km (${(distanceScore * 40).toFixed(0)}%)`);

    // 2. Specialization match (25% weight)
    const specializationScore = this.getSpecializationScore(worker, service);
    totalScore += specializationScore * 0.25;
    factors.push(`Specialization: ${(specializationScore * 25).toFixed(0)}%`);

    // 3. Rating score (20% weight)
    const ratingScore = (worker.averageRating || 3) / 5;
    totalScore += ratingScore * 0.2;
    factors.push(`Rating: ${worker.averageRating || 3}/5 (${(ratingScore * 20).toFixed(0)}%)`);

    // 4. Current workload (10% weight)
    const workloadScore = await this.getWorkloadScore(worker.id);
    totalScore += workloadScore * 0.1;
    factors.push(`Workload: ${(workloadScore * 10).toFixed(0)}%`);

    // 5. Availability status (5% weight)
    const availabilityScore = worker.availability === 'available' ? 1 : 0.5;
    totalScore += availabilityScore * 0.05;
    factors.push(`Available: ${worker.availability}`);

    reason = `Score: ${(totalScore * 100).toFixed(0)}% (${factors.join(', ')})`;

    return {
      workerId: worker.id,
      score: totalScore,
      distance,
      availability: worker.availability || 'offline',
      specialization: worker.specialization || [],
      rating: worker.averageRating || 3,
      reason
    };
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Distance-based scoring (closer is better)
  private getDistanceScore(distance: number): number {
    if (distance <= 2) return 1; // Perfect score for <= 2km
    if (distance <= 5) return 0.8; // Good score for <= 5km
    if (distance <= 10) return 0.6; // Fair score for <= 10km
    if (distance <= 20) return 0.4; // Poor score for <= 20km
    return 0.1; // Very poor score for > 20km
  }

  // Specialization matching score
  private getSpecializationScore(worker: Worker, service: Service): number {
    const specializations = worker.specialization || [];
    
    if (specializations.includes(service.category)) {
      return 1; // Perfect match
    }
    
    // Check for related specializations
    const relatedMap: { [key: string]: string[] } = {
      'cuci_mobil': ['cuci_motor', 'detailing'],
      'cuci_motor': ['cuci_mobil', 'detailing'],
      'potong_rumput': ['gardening', 'landscaping']
    };
    
    const relatedSpecs = relatedMap[service.category] || [];
    const hasRelated = specializations.some(spec => relatedSpecs.includes(spec));
    
    if (hasRelated) {
      return 0.7; // Good match
    }
    
    return 0.3; // Basic match (can do any service)
  }

  // Current workload score (fewer active orders is better)
  private async getWorkloadScore(workerId: number): Promise<number> {
    try {
      const activeOrders = await storage.getOrdersByWorker(workerId);
      const currentOrders = activeOrders.filter(order => 
        ['accepted', 'ontheway', 'arrived', 'inprogress'].includes(order.status)
      );
      
      if (currentOrders.length === 0) return 1; // No current orders
      if (currentOrders.length === 1) return 0.7; // One order
      if (currentOrders.length === 2) return 0.4; // Two orders
      return 0.1; // Too many orders
    } catch (error) {
      return 0.5; // Default score on error
    }
  }

  // Assign order to worker
  private async assignOrderToWorker(orderId: number, workerId: number, reason: string): Promise<void> {
    try {
      // Update order with worker assignment
      await storage.updateOrder(orderId, {
        workerId,
        status: 'assigned',
        assignedAt: new Date(),
        timeline: [
          {
            status: 'assigned',
            timestamp: new Date(),
            description: `Order assigned to worker (${reason})`,
            location: null
          }
        ]
      });
      
    } catch (error) {
      console.error('Failed to assign order to worker:', error);
      throw error;
    }
  }

  // Auto-assign pending orders (can be called periodically)
  async processPendingOrders(): Promise<void> {
    try {
      const pendingOrders = await storage.getPendingOrders();
      
      for (const order of pendingOrders) {
        if (order.status === 'confirmed' && !order.workerId) {
          const customerInfo = typeof order.customerInfo === 'string' 
            ? JSON.parse(order.customerInfo) 
            : order.customerInfo;
          
          if (customerInfo?.location) {
            const request: OrderAssignmentRequest = {
              orderId: order.id,
              serviceId: order.serviceId,
              customerLocation: customerInfo.location,
              urgency: 'medium',
              scheduledTime: order.scheduledTime || undefined
            };
            
            const assignedWorker = await this.assignOptimalWorker(request);
            
            if (assignedWorker) {
              console.log(`Order ${order.trackingId} assigned to worker ${assignedWorker.id}`);
            } else {
              console.log(`No suitable worker found for order ${order.trackingId}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing pending orders:', error);
    }
  }
}

export const orderAssignmentService = new OrderAssignmentService();