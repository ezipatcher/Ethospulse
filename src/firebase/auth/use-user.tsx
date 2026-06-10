
'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../index';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase Auth is not initialized (Prototype Mode), return a Mock Guest User
    if (!auth) {
      setUser({
        uid: "guest_user_123",
        displayName: "Guest Hero",
        isAnonymous: true,
      } as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Fallback to Guest User identity if logged out in Prototype Mode
        setUser({
          uid: "guest_user_123",
          displayName: "Guest Hero",
          isAnonymous: true,
        } as User);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
