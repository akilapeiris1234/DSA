/**
 * Event System (EventBus)
 * Pub/sub event bus for decoupled communication across the entire app
 *
 * Concepts:
 * - Event-Driven Programming: Core infrastructure — components communicate via events
 * - Low Coupling: Emitters and listeners don't know about each other
 * - Separation of Concerns: Event types (AuthEvent, GameEvent) are separate unions
 * - Interoperability: Any hook, service, or component can subscribe/emit
 */

export type AuthEvent =
  | { type: 'LOGIN_SUCCESS'; payload: { uid: string; email: string } }
  | { type: 'SIGNUP_SUCCESS'; payload: { uid: string; email: string } }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_ERROR'; payload: { error: string } }
  | { type: 'USER_PROFILE_CREATED'; payload: { uid: string } }
  | { type: 'GOOGLE_LOGIN'; payload: { uid: string; isNewUser: boolean } };

export type GameEvent =
  | { type: 'GAME_STARTED' }
  | { type: 'HOW_TO_PLAY_REQUESTED' }
  | { type: 'GAME_COMPLETED'; payload: { score: number } }
  | { type: 'GAME_OVER'; payload: { won: boolean; hearts: number; carrots: number; time: number } }
  | { type: 'SCORE_SAVED'; payload: { uid: string; difficulty: string } };

export type AppEvent = AuthEvent | GameEvent;

type EventListener<T extends AppEvent> = (event: T) => void;

class EventBus {
  private listeners: Map<AppEvent['type'], Set<EventListener<AppEvent>>> = new Map();

  subscribe<T extends AppEvent['type']>(
    eventType: T,
    listener: EventListener<Extract<AppEvent, { type: T }>>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const set = this.listeners.get(eventType)!;
    set.add(listener as EventListener<AppEvent>);

    // Return unsubscribe function
    return () => {
      set.delete(listener as EventListener<AppEvent>);
    };
  }

  emit<T extends AppEvent>(event: T): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
        }
      });
    }
  }

  clear(eventType?: AppEvent['type']): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();
