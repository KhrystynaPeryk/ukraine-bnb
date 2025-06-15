'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { auth } from '../libs/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextType {
  currentUser: User | null;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to create or get user in database
  const createOrGetUser = async (firebaseUser: User) => {
    try {
      console.log('🔄 Creating or getting user for UID:', firebaseUser.uid);
      
      // First try to get existing user
      const getResponse = await fetch(`/api/users/${firebaseUser.uid}`);
      console.log('📥 GET user response status:', getResponse.status);
      
      if (getResponse.ok) {
        const existingUser = await getResponse.json();
        console.log('✅ Found existing user:', existingUser);
        return existingUser;
      }

      // User doesn't exist, create new one
      if (getResponse.status === 404) {
        console.log('➕ User not found, creating new user...');
        
        const userData = {
          firebaseUid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified ? new Date() : null,
          image: firebaseUser.photoURL
        };
        
        console.log('📤 Sending user data:', userData);
        
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });

        console.log('📥 POST user response status:', createResponse.status);

        if (createResponse.ok) {
          const newUser = await createResponse.json();
          console.log('✅ Created new user:', newUser);
          return newUser;
        } else {
          const errorText = await createResponse.text();
          console.error('❌ Failed to create user:', errorText);
          throw new Error('Failed to create user in database');
        }
      }

      throw new Error('Unexpected response from server');
    } catch (error) {
      console.error('❌ Error in createOrGetUser:', error);
      throw error;
    }
  };

  // Sign up function
  async function signup(email: string, password: string, displayName: string): Promise<void> {
    console.log('📝 Starting signup process for:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(result.user, {
      displayName: displayName
    });
    
    await sendEmailVerification(result.user);
    
    // Create user in database
    await createOrGetUser(result.user);
    console.log('✅ Signup completed');
  }

async function login(email: string, password: string): Promise<void> {
    console.log('🔐 Starting login process for:', email);
    
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        // Reload user to get latest verification status
        await result.user.reload();
        
        // Check verification immediately after login
        if (!result.user.emailVerified) {
             
            // Sign out immediately
            await signOut(auth);
            
            // Throw error with helpful message
            const error = new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
            error.name = 'EmailNotVerifiedError';
            throw error;
        }
        
    } catch (error: any) {
        throw error;
    }
}

  // Google login function
  async function loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user exists in database, if not create them
    const response = await fetch(`/api/users/${result.user.uid}`);
    if (response.status === 404) {
      await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          emailVerified: result.user.emailVerified ? new Date() : null,
          image: result.user.photoURL
        })
      });
    }
    
    toast.success('Logged in with Google!');
  }

  // Logout function
  async function logout(): Promise<void> {
    console.log('👋 Logging out...');
    await signOut(auth);
    router.push('/');
  }

  // Reset password function
  async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Resend email verification
  async function resendEmailVerification(): Promise<void> {
    if (currentUser) {
      await sendEmailVerification(currentUser);
      return;
    }
    throw new Error('No current user');
  }

  useEffect(() => {
    console.log('🔄 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔄 Auth state changed:', user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      } : 'No user');
      
      if (user) {
        // Check if email is verified
        if (!user.emailVerified) {
          console.log('❌ Email not verified, signing out...');
          await signOut(auth);
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        console.log('✅ Email verified, setting user');
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    resendEmailVerification,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}