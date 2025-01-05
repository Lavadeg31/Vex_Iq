import { Score, User } from '@/types/dashboard'

export const storage = {
  getScores: (): Score[] => {
    if (typeof window === 'undefined') return []
    const scores = localStorage.getItem('scores')
    return scores ? JSON.parse(scores) : []
  },

  saveScore: (score: Omit<Score, 'id' | 'date'>) => {
    const scores = storage.getScores()
    const newScore = {
      ...score,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    }
    localStorage.setItem('scores', JSON.stringify([...scores, newScore]))
    return newScore
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  saveUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

