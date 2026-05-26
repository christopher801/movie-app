// src/services/firestore.js
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  setDoc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, increment, arrayUnion, arrayRemove,
  startAfter, getCountFromServer
} from 'firebase/firestore'
import { db } from './firebase'

// ─── MOVIES / CONTENT ────────────────────────────────────────────────
export const getContents = async (filters = {}, lastDoc = null, pageSize = 20) => {
  let q = collection(db, 'contents')
  const constraints = []

  if (filters.type)   constraints.push(where('type', '==', filters.type))
  if (filters.genre)  constraints.push(where('genres', 'array-contains', filters.genre))
  if (filters.status) constraints.push(where('status', '==', filters.status))

  constraints.push(orderBy(filters.orderBy || 'createdAt', 'desc'))
  constraints.push(limit(pageSize))
  if (lastDoc) constraints.push(startAfter(lastDoc))

  const snap = await getDocs(query(q, ...constraints))
  return {
    data: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    lastDoc: snap.docs[snap.docs.length - 1] || null,
    hasMore: snap.docs.length === pageSize
  }
}

export const getContentById = async (id) => {
  const snap = await getDoc(doc(db, 'contents', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getFeaturedContent = async () => {
  const snap = await getDocs(query(
    collection(db, 'contents'),
    where('featured', '==', true),
    where('status', '==', 'published'),
    limit(5)
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const searchContents = async (searchTerm) => {
  // Simple Firestore-compatible search by title prefix
  const end = searchTerm + '\uf8ff'
  const snap = await getDocs(query(
    collection(db, 'contents'),
    where('titleLower', '>=', searchTerm.toLowerCase()),
    where('titleLower', '<=', end.toLowerCase()),
    where('status', '==', 'published'),
    limit(20)
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addContent = async (data) => {
  const ref = await addDoc(collection(db, 'contents'), {
    ...data,
    titleLower: data.title.toLowerCase(),
    views:      0,
    rating:     0,
    ratingCount: 0,
    status:     data.status || 'draft',
    createdAt:  serverTimestamp(),
    updatedAt:  serverTimestamp(),
  })
  return ref.id
}

export const updateContent = async (id, data) => {
  await updateDoc(doc(db, 'contents', id), {
    ...data,
    titleLower: data.title ? data.title.toLowerCase() : undefined,
    updatedAt: serverTimestamp()
  })
}

export const deleteContent = async (id) => {
  await deleteDoc(doc(db, 'contents', id))
}

export const incrementViews = async (id) => {
  await updateDoc(doc(db, 'contents', id), { views: increment(1) })
}

// ─── EPISODES (for series) ────────────────────────────────────────────
export const getEpisodes = async (contentId) => {
  const snap = await getDocs(query(
    collection(db, 'contents', contentId, 'episodes'),
    orderBy('season'), orderBy('episode')
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addEpisode = async (contentId, data) => {
  const ref = await addDoc(collection(db, 'contents', contentId, 'episodes'), {
    ...data, createdAt: serverTimestamp()
  })
  return ref.id
}

export const updateEpisode = async (contentId, episodeId, data) => {
  await updateDoc(doc(db, 'contents', contentId, 'episodes', episodeId), data)
}

export const deleteEpisode = async (contentId, episodeId) => {
  await deleteDoc(doc(db, 'contents', contentId, 'episodes', episodeId))
}

// ─── USER PROFILE ────────────────────────────────────────────────────
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    role:      'user',
    watchlist: [],
    createdAt: serverTimestamp(),
  })
}

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })
}

// ─── WATCHLIST ────────────────────────────────────────────────────────
export const addToWatchlist = async (uid, contentId) => {
  await updateDoc(doc(db, 'users', uid), { watchlist: arrayUnion(contentId) })
}

export const removeFromWatchlist = async (uid, contentId) => {
  await updateDoc(doc(db, 'users', uid), { watchlist: arrayRemove(contentId) })
}

export const getWatchlistContents = async (contentIds) => {
  if (!contentIds?.length) return []
  const promises = contentIds.map(id => getContentById(id))
  const results = await Promise.all(promises)
  return results.filter(Boolean)
}

// ─── CONTINUE WATCHING ───────────────────────────────────────────────
export const saveContinueWatching = async (uid, contentId, progress) => {
  await setDoc(doc(db, 'users', uid, 'continueWatching', contentId), {
    contentId,
    progress,     // seconds watched
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export const getContinueWatching = async (uid) => {
  const snap = await getDocs(query(
    collection(db, 'users', uid, 'continueWatching'),
    orderBy('updatedAt', 'desc'),
    limit(10)
  ))
  return snap.docs.map(d => d.data())
}

// ─── RATINGS ─────────────────────────────────────────────────────────
export const rateContent = async (uid, contentId, value) => {
  const ratingRef = doc(db, 'contents', contentId, 'ratings', uid)
  const existing  = await getDoc(ratingRef)

  await setDoc(ratingRef, { uid, value, createdAt: serverTimestamp() })

  const allRatings = await getDocs(collection(db, 'contents', contentId, 'ratings'))
  const total = allRatings.docs.reduce((s, d) => s + d.data().value, 0)
  const avg   = total / allRatings.size

  await updateDoc(doc(db, 'contents', contentId), {
    rating:      parseFloat(avg.toFixed(1)),
    ratingCount: allRatings.size,
  })

  return avg
}

export const getUserRating = async (uid, contentId) => {
  const snap = await getDoc(doc(db, 'contents', contentId, 'ratings', uid))
  return snap.exists() ? snap.data().value : null
}

// ─── GENRES ──────────────────────────────────────────────────────────
export const getGenres = async () => {
  const snap = await getDocs(collection(db, 'genres'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const addGenre = async (name) => {
  await addDoc(collection(db, 'genres'), { name, createdAt: serverTimestamp() })
}

// ─── ADMIN STATS ─────────────────────────────────────────────────────
export const getAdminStats = async () => {
  const [contentsSnap, usersSnap] = await Promise.all([
    getCountFromServer(collection(db, 'contents')),
    getCountFromServer(collection(db, 'users')),
  ])
  const publishedSnap = await getCountFromServer(
    query(collection(db, 'contents'), where('status', '==', 'published'))
  )
  return {
    totalContents:   contentsSnap.data().count,
    totalUsers:      usersSnap.data().count,
    publishedCount:  publishedSnap.data().count,
  }
}

// ─── REAL-TIME LISTENERS ─────────────────────────────────────────────
export const onContentsChange = (callback) =>
  onSnapshot(
    query(collection(db, 'contents'), orderBy('createdAt', 'desc'), limit(50)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )

export const onUsersChange = (callback) =>
  onSnapshot(
    query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100)),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
