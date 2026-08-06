class EventBus {
  constructor() {
    this.subscribers = new Map();
  }

  /**
   * Subscribe to a business event
   * @param {string} eventName Name of the event to listen to
   * @param {Function} callback Function to call when event is published
   */
  subscribe(eventName, callback) {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, []);
    }
    this.subscribers.get(eventName).push(callback);
    return () => this.unsubscribe(eventName, callback);
  }

  /**
   * Unsubscribe from a business event
   */
  unsubscribe(eventName, callback) {
    if (this.subscribers.has(eventName)) {
      const list = this.subscribers.get(eventName);
      const index = list.indexOf(callback);
      if (index !== -1) {
        list.splice(index, 1);
      }
    }
  }

  /**
   * Publish a business event to all registered subscribers
   * @param {string} eventName Name of the event (e.g. 'purchase-request.created')
   * @param {object} payload Event payload metadata
   */
  async publish(eventName, payload) {
    const list = this.subscribers.get(eventName);
    if (!list || list.length === 0) return;

    // Execute all subscribers asynchronously to avoid blocking the caller
    list.forEach(callback => {
      Promise.resolve()
        .then(() => callback(payload))
        .catch(err => {
          console.error(`[EventBus] Error in subscriber callback for event "${eventName}":`, err);
        });
    });
  }
}

export const eventBus = new EventBus();
