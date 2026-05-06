export type Cursor = {
  anchor: number;
  head: number;
}

export type User = {
  id: string;
  name: string;
  color: string;
}

export type AwarenessState = {
  user: User;
  cursor: Cursor | null;
}

type Listener = () => void;

export type AwarenessManager = {
  local: AwarenessState;
  states: Map<string, AwarenessState>;

  setUser: (user: User) => void;
  setCursor: (cursor: Cursor | null) => void;

  onChange: (cb: Listener) => () => void;
  emitChange: () => void;

  replaceAll: (data: Record<string, AwarenessState>) => void;
}

// cursor of random color
function randomColor() {
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#a855f7",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function createAwarenessManager(name: string): AwarenessManager {
  const listeners = new Set<Listener>();

  const manager: AwarenessManager = {
    local: {
      user: {
        id: crypto.randomUUID(),
        name,
        color: randomColor(),
      },
      cursor: null,
    },

    states: new Map(),

    setUser(user) {
      manager.local.user = user;
      manager.emitChange();
    },

    setCursor(cursor) {
      manager.local.cursor = cursor;
      manager.emitChange();
    },

    onChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },

    emitChange() {
      listeners.forEach((cb) => cb());
    },

    replaceAll(data) {
      manager.states = new Map(Object.entries(data));
      manager.emitChange();
    },
  };

  return manager;
}