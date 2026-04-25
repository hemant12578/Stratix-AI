import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth, db } from '../config/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import axios from '../config/api'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)

  // Sign up with email and password
  const signup = async (email, password, name) => {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update display name
    if (name) {
      try {
        await updateProfile(userCredential.user, { displayName: name })
      } catch (error) {
        console.warn('Failed to update profile:', error)
      }
    }
    
    // Create user profile in Firestore (non-blocking)
    if (db) {
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          name: name || '',
          createdAt: new Date().toISOString(),
          requestsUsed: 0,
          subscriptionTier: 'free'
        })
      } catch (error) {
        console.warn('Failed to create Firestore profile:', error)
        // Don't block signup if Firestore fails
      }
    }
    
    return userCredential
  }

  // Sign in with email and password
  const login = (email, password) => {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    
    // Check if user exists in Firestore, if not create profile (non-blocking)
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email,
            name: userCredential.user.displayName || '',
            createdAt: new Date().toISOString(),
            requestsUsed: 0,
            subscriptionTier: 'free'
          })
        }
      } catch (error) {
        console.warn('Failed to access Firestore:', error)
        // Don't block sign-in if Firestore fails
      }
    }
    
    return userCredential
  }

  // Sign in with GitHub
  const signInWithGithub = async () => {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    const provider = new GithubAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    
    // Create profile in Firestore if missing (non-blocking)
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
        if (!userDoc.exists()) {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: userCredential.user.email || '',
            name: userCredential.user.displayName || '',
            createdAt: new Date().toISOString(),
            requestsUsed: 0,
            subscriptionTier: 'free'
          })
        }
      } catch (error) {
        console.warn('Failed to access Firestore:', error)
        // Don't block sign-in if Firestore fails
      }
    }
    
    return userCredential
  }

  // Sign out
  const logout = () => {
    if (!auth) {
      return Promise.resolve()
    }
    return signOut(auth)
  }

  // Reset password
  const resetPassword = (email) => {
    if (!auth) {
      throw new Error('Firebase auth not initialized')
    }
    return sendPasswordResetEmail(auth, email)
  }

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (currentUser) {
      try {
        await updateProfile(currentUser, updates)
        if (updates.displayName && db) {
          try {
            await setDoc(doc(db, 'users', currentUser.uid), {
              name: updates.displayName
            }, { merge: true })
          } catch (error) {
            console.warn('Failed to update Firestore profile:', error)
          }
        }
      } catch (error) {
        console.warn('Failed to update profile:', error)
        throw error
      }
    }
  }

  // Fetch user profile from Firestore (non-blocking)
  useEffect(() => {
    if (currentUser && db) {
      const fetchProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() })
          } else {
            // Create profile if it doesn't exist
            if (db) {
              try {
                await setDoc(doc(db, 'users', currentUser.uid), {
                  email: currentUser.email || '',
                  name: currentUser.displayName || '',
                  createdAt: new Date().toISOString(),
                  requestsUsed: 0,
                  subscriptionTier: 'free'
                })
                setUserProfile({
                  id: currentUser.uid,
                  email: currentUser.email || '',
                  name: currentUser.displayName || '',
                  createdAt: new Date().toISOString(),
                  requestsUsed: 0,
                  subscriptionTier: 'free'
                })
              } catch (error) {
                console.warn('Failed to create Firestore profile:', error)
                // Set default profile even if Firestore fails
                setUserProfile({
                  id: currentUser.uid,
                  email: currentUser.email || '',
                  name: currentUser.displayName || '',
                  subscriptionTier: 'free',
                  requestsUsed: 0
                })
              }
            } else {
              // Set default profile if Firestore is not available
              setUserProfile({
                id: currentUser.uid,
                email: currentUser.email || '',
                name: currentUser.displayName || '',
                subscriptionTier: 'free',
                requestsUsed: 0
              })
            }
          }
        } catch (error) {
          console.warn('Firestore not available or offline:', error.message)
          // Set a default profile if Firestore is unavailable
          setUserProfile({
            id: currentUser.uid,
            email: currentUser.email || '',
            name: currentUser.displayName || '',
            subscriptionTier: 'free',
            requestsUsed: 0
          })
        }
      }
      fetchProfile()
    } else {
      setUserProfile(null)
    }
  }, [currentUser])

  // Keep backend user list synced for admin dashboard analytics/control.
  useEffect(() => {
    const syncUserToBackend = async () => {
      if (!currentUser?.email) return
      try {
        await axios.post('/api/user/sync', {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || '',
          subscriptionTier: userProfile?.subscriptionTier || 'free',
          requestsUsed: userProfile?.requestsUsed || 0,
          active: true,
        })
      } catch (error) {
        console.warn('User sync to backend failed:', error?.message || error)
      }
    }
    syncUserToBackend()
  }, [currentUser, userProfile])

  // Monitor auth state
  useEffect(() => {
    if (!auth) {
      console.warn('Firebase auth not initialized, skipping auth state monitoring')
      setLoading(false)
      return
    }
    
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user)
        setLoading(false)
      }, (error) => {
        console.error('Auth state error:', error)
        setLoading(false)
      })

      return unsubscribe
    } catch (error) {
      console.error('Failed to initialize auth state monitoring:', error)
      setLoading(false)
    }
  }, [])

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    signInWithGoogle,
    signInWithGithub,
    logout,
    resetPassword,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
