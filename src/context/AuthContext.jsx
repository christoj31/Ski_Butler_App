import { createContext, useState, useContext } from 'react'
import { MOCK_USERS } from '../data/mockUsers'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)

  function login(username, password) {
    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    )
    if (user) {
      setCurrentUser({ username: user.username })
      return { success: true }
    }
    return { success: false }
  }

  function logout() {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
