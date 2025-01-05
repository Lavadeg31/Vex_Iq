export interface Score {
  id: string
  score: number
  balls: number
  switches: number
  passes: number
  mode: 'teamwork' | 'skills'
  date: string
}

export interface User {
  email: string
  settings: {
    theme: 'dark' | 'light'
  }
}

