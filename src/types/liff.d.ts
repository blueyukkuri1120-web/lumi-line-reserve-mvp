export {};

declare global {
  interface Window {
    liff?: {
      init: (options: { liffId: string }) => Promise<void>;
      isLoggedIn: () => boolean;
      login: () => void;
      isInClient: () => boolean;
      getProfile: () => Promise<{
        userId: string;
        displayName: string;
      }>;
    };
  }
}
