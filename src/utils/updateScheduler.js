/**
 * This module provides a single-timer solution for managing automatic data updates
 * across all service components in Homer. Instead of each service component creating
 * its own setInterval timer, all components register with this centralized scheduler.
 *
 */

const TICK_INTERVAL_MS = 1000; // 1 second tick resolution
const MIN_INTERVAL_MS = TICK_INTERVAL_MS; // Minimum allowed update interval

class UpdateScheduler {
  constructor() {
    this.registeredComponents = new Map();
    this.globalTimer = null;
    this.tickCount = 0;
    this.isRunning = false;
  }

  register(component, intervalMs, updateMethod) {
    if (!component || !updateMethod || intervalMs <= 0) {
      console.warn("UpdateScheduler: Invalid registration parameters");
      return;
    }

    if (intervalMs < MIN_INTERVAL_MS) {
      console.warn(
        `UpdateScheduler: Interval ${intervalMs}ms is below minimum. Adjusting to ${MIN_INTERVAL_MS}ms`,
      );
      intervalMs = MIN_INTERVAL_MS;
    }

    const intervalSeconds = Math.floor(intervalMs / 1000);
    const componentId = this.generateComponentId(component);

    this.registeredComponents.set(componentId, {
      component,
      interval: intervalSeconds,
      method: updateMethod,
      lastUpdate: 0,
    });

    this.startGlobalTimer();
    console.log(
      `UpdateScheduler: Registered component with ${intervalSeconds}s interval`,
    );
  }

  unregister(component) {
    const componentId = this.generateComponentId(component);
    const removed = this.registeredComponents.delete(componentId);

    if (removed) {
      console.log("UpdateScheduler: Unregistered component");
    }

    if (this.registeredComponents.size === 0) {
      this.stopGlobalTimer();
    }
  }

  generateComponentId(component) {
    // Use component's unique identifier or Vue instance uid
    return component._uid || component.$.uid || Symbol("component");
  }

  startGlobalTimer() {
    if (!this.globalTimer && !this.isRunning) {
      this.isRunning = true;
      this.tickCount = 0;

      this.globalTimer = setInterval(() => {
        this.tickCount++;
        this.processUpdates();
      }, TICK_INTERVAL_MS);

      console.log("UpdateScheduler: Global timer started");
    }
  }

  stopGlobalTimer() {
    if (this.globalTimer) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
      this.isRunning = false;
      this.tickCount = 0;
      console.log("UpdateScheduler: Global timer stopped");
    }
  }

  processUpdates() {
    for (const [, config] of this.registeredComponents) {
      try {
        if (this.tickCount - config.lastUpdate >= config.interval) {
          config.method.call(config.component);
          config.lastUpdate = this.tickCount;
        }
      } catch (error) {
        console.error("UpdateScheduler: Error during component update:", error);
      }
    }
  }

  pause() {
    if (this.globalTimer) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
      this.isRunning = false;
      console.log("UpdateScheduler: Paused");
    }
  }

  resume() {
    if (!this.globalTimer && this.registeredComponents.size > 0) {
      this.startGlobalTimer();
      console.log("UpdateScheduler: Resumed");
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      registeredCount: this.registeredComponents.size,
      tickCount: this.tickCount,
    };
  }
}

// Create and export global singleton instance
const updateScheduler = new UpdateScheduler();

// Pause updates when tab is hidden (power saving)
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      updateScheduler.pause();
    } else {
      updateScheduler.resume();
    }
  });
}

export default updateScheduler;
