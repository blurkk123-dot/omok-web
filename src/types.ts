export type Stone = 'black' | 'white'
export type Cell = Stone | null
export type Board = Cell[][]
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Point = {
  row: number
  col: number
}

export type ForbiddenReason = 'double-three' | 'double-four' | 'overline'

export type ForbiddenResult = {
  forbidden: boolean
  reasons: ForbiddenReason[]
}

export type GameStatus = 'playing' | 'black-win' | 'white-win' | 'draw'
