/**
 * System Monitoring Service
 * Periodically checks system health and logs uptime data
 */

import { trackSystemUptime } from './api-tracker';

export class SystemMonitor {
  private static instance: SystemMonitor;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly checkInterval = 60000; // Check every minute

  private constructor() {}

  public static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  public startMonitoring(): void {
    if (this.intervalId) {
      return; // Already monitoring
    }

    console.log('Starting system monitoring...');
    
    // Initial check
    this.checkSystemHealth();
    
    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.checkSystemHealth();
    }, this.checkInterval);
  }

  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('System monitoring stopped');
    }
  }

  private async checkSystemHealth(): Promise<void> {
    const services = [
      { name: 'database', check: this.checkDatabase },
      { name: 'redis', check: this.checkRedis },
      { name: 'api', check: this.checkApi },
    ];

    for (const service of services) {
      try {
        const startTime = Date.now();
        const isHealthy = await service.check();
        const responseTime = Date.now() - startTime;
        
        await trackSystemUptime(
          service.name,
          isHealthy,
          responseTime,
          isHealthy ? undefined : 'Service check failed'
        );
      } catch (error) {
        console.error(`Error checking ${service.name}:`, error);
        await trackSystemUptime(
          service.name,
          false,
          undefined,
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const { prisma } = await import('./db');
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const { redis } = await import('./redis');
      await redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  private async checkApi(): Promise<boolean> {
    try {
      // Simple health check - try to access a basic endpoint
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        timeout: 5000,
      } as any);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  const monitor = SystemMonitor.getInstance();
  monitor.startMonitoring();
}
