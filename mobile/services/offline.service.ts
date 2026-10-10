// Simple offline queue manager for dose actions
export interface QueuedAction {
  id: string;
  logId: string;
  action: 'taken' | 'skipped';
  timestamp: number;
}

class OfflineService {
  private queue: QueuedAction[] = [];
  private isOffline = false;

  setOfflineStatus(status: boolean) {
    this.isOffline = status;
  }

  getOfflineStatus(): boolean {
    return this.isOffline;
  }

  queueAction(logId: string, action: 'taken' | 'skipped') {
    this.queue.push({
      id: Math.random().toString(36).substring(7),
      logId,
      action,
      timestamp: Date.now(),
    });
  }

  getQueue(): QueuedAction[] {
    return [...this.queue];
  }

  clearQueue() {
    this.queue = [];
  }
}

export const offlineService = new OfflineService();
