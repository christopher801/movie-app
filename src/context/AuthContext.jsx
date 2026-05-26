// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { createUserProfile, getUserProfile } from '../services/firestore'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,        setUser]        = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid)
        setProfile(p)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    await createUserProfile(cred.user.uid, { email, displayName, photoURL: '' })
    const p = await getUserProfile(cred.user.uid)
    setProfile(p)
    return cred.user
  }

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const p    = await getUserProfile(cred.user.uid)
    setProfile(p)
    return cred.user
  }

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const cred     = await signInWithPopup(auth, provider)
    let p = await getUserProfile(cred.user.uid)
    if (!p) {
      await createUserProfile(cred.user.uid, {
        email:       cred.user.email,
        displayName: cred.user.displayName,
        photoURL:    cred.user.photoURL,
      })
      p = await getUserProfile(cred.user.uid)
    }
    setProfile(p)
    return cred.user
  }

  const logout = () => signOut(auth)

  const resetPassword = (email) => sendPasswordResetEmail(auth, email)

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid)
      setProfile(p)
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAdmin,
      register, login, loginWithGoogle,
      logout, resetPassword, refreshProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
