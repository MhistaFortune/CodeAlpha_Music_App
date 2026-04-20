import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
}

interface UserRecord extends User {
  password?: string; // Stored password (mock)
}

interface AuthState {
  user: User | null;
  usersRecord: Record<string, UserRecord>; // Mock database mapping email to User

  // Actions
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (email: string, username: string, avatarUrl: string, password?: string) => { success: boolean; error?: string };
  updateProfile: (email: string, username: string, avatarUrl: string, newPassword?: string) => { success: boolean; error?: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      usersRecord: {},

      login: (email: string, password?: string) => {
        const { usersRecord } = get();
        const existingUser = usersRecord[email.toLowerCase()];
        
        if (!existingUser) {
          return { success: false, error: 'No account found with that email. Please sign up first.' };
        }

        if (existingUser.password !== password) {
          return { success: false, error: 'Incorrect password.' };
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = existingUser;
        set({ user: userWithoutPassword });
        return { success: true };
      },

      register: (email: string, username: string, avatarUrl: string, password?: string) => {
        const { usersRecord } = get();
        const normalizedEmail = email.toLowerCase();

        if (usersRecord[normalizedEmail]) {
          return { success: false, error: 'Account with this email already exists.' };
        }

        const newUserRecord: UserRecord = {
          id: `usr_${crypto.randomUUID()}`,
          email: normalizedEmail,
          username,
          avatarUrl: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3b82f6&color=fff`,
          password,
        };

        const { password: _, ...userWithoutPassword } = newUserRecord;

        set((state) => ({
          usersRecord: { ...state.usersRecord, [normalizedEmail]: newUserRecord },
          user: userWithoutPassword,
        }));

        return { success: true };
      },

      updateProfile: (email: string, username: string, avatarUrl: string, newPassword?: string) => {
        const { usersRecord } = get();
        const normalizedEmail = email.toLowerCase();
        const existingRecord = usersRecord[normalizedEmail];

        if (!existingRecord) {
          return { success: false, error: 'User not found in system.' };
        }

        const updatedRecord: UserRecord = {
          ...existingRecord,
          username,
          avatarUrl: avatarUrl || existingRecord.avatarUrl,
        };
        
        if (newPassword && newPassword.trim().length > 0) {
          updatedRecord.password = newPassword;
        }

        const { password: _, ...userWithoutPassword } = updatedRecord;

        set((state) => ({
          usersRecord: { ...state.usersRecord, [normalizedEmail]: updatedRecord },
          user: state.user?.email === normalizedEmail ? userWithoutPassword : state.user,
        }));

        return { success: true };
      },

      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'soundscape-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
