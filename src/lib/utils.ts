// src/lib/utils.ts

/**
 * Genera un ID aleatorio seguro para códigos de invitación.
 */
export function randomId(length = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
  
    for (let i = 0; i < length; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
  
    return id;
  }
  
  /**
   * Fisher–Yates shuffle: aleatoriza un array sin mutarlo.
   */
  export function shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  