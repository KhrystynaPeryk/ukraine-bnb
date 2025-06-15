'use client'

import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User } from '@prisma/client';

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (firebaseUser: FirebaseUser) => {
    if (firebaseUser && firebaseUser.emailVerified) {
      try {
        const response = await fetch(`/api/users/${firebaseUser.uid}`);
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      await fetchUser(firebaseUser);
    }
  }, [fetchUser]);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Reload user to get latest emailVerified status
        firebaseUser.reload().then(() => {
          fetchUser(firebaseUser);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUser]);

  return { currentUser, loading, refreshUser };
}