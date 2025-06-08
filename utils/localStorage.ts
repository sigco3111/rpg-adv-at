
export const loadFromLocalStorage = <T,>(key: string): T | null => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState) as T;
  } catch (error) {
    console.error("Could not load state from localStorage", error);
    return null;
  }
};

export const saveToLocalStorage = <T,>(key: string, state: T): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.error("Could not save state to localStorage", error);
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error)
    {
    console.error("Could not remove state from localStorage", error);
  }
};
