// Global state management setup (Zustand/Redux/etc. can be configured here)

// Example using a simple store pattern
export interface StoreState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

// Placeholder for actual store implementation
export const createStore = () => {
  return {
    isLoading: false,
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
  };
};
