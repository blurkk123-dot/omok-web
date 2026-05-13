import type { Board, Difficulty, Point, Stone } from '../types'
import { BOARD_SIZE, countFourThreats, getCandidates, hasExactFive, placeStone } from './omok'

const AI: Stone = 'white'
const HUMAN: Stone = 'black'

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function winningMove(board: Board, stone: Stone, candidates: Point[]): Point | null {
  for (const point of candidates) {
    const next = placeStone(board, point, stone)
    if (hasExactFive(next, point, stone)) return point
  }

  return null
}

function countLine(board: Board, point: Point, stone: Stone, dr: number, dc: number): { stones: number; open: number } {
  let stones = 1
  let open = 0

  for (const sign of [-1, 1]) {
    let row = point.row + dr * sign
    let col = point.col + dc * sign

    while (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === stone) {
      stones += 1
      row += dr * sign
      col += dc * sign
    }

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === null) {
      open += 1
    }
  }

  return { stones, open }
}

function scoreFor(board: Board, point: Point, stone: Stone): number {
  const next = placeStone(board, point, stone)
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const
  let score = 0

  for (const [dr, dc] of directions) {
    const { stones, open } = countLine(next, point, stone, dr, dc)

    if (stones >= 5) score += 100000
    else if (stones === 4 && open === 2) score += 20000
    else if (stones === 4 && open === 1) score += 7000
    else if (stones === 3 && open === 2) score += 2500
    else if (stones === 3 && open === 1) score += 700
    else if (stones === 2 && open === 2) score += 250
    else if (stones === 2 && open === 1) score += 80
  }

  score += countFourThreats(next, point, stone) * 4500

  return score
}

function centerScore(point: Point): number {
  const center = (BOARD_SIZE - 1) / 2
  return 60 - (Math.abs(point.row - center) + Math.abs(point.col - center)) * 4
}

function bestByScore(board: Board, candidates: Point[], defensiveWeight: number): Point {
  let best = candidates[0]
  let bestScore = Number.NEGATIVE_INFINITY

  for (const point of candidates) {
    const attack = scoreFor(board, point, AI)
    const defense = scoreFor(board, point, HUMAN)
    const score = attack + defense * defensiveWeight + centerScore(point) + Math.random() * 8

    if (score > bestScore) {
      bestScore = score
      best = point
    }
  }

  return best
}

export function chooseAiMove(board: Board, difficulty: Difficulty): Point {
  const candidates = getCandidates(board, difficulty === 'advanced' ? 2 : 1)
  const win = winningMove(board, AI, candidates)
  if (win) return win

  const block = winningMove(board, HUMAN, candidates)
  if (block && difficulty !== 'beginner') return block

  if (difficulty === 'beginner') {
    const prioritized = candidates.filter((point) => scoreFor(board, point, AI) > 120 || scoreFor(board, point, HUMAN) > 180)
    return randomItem(prioritized.length ? prioritized : candidates)
  }

  if (difficulty === 'intermediate') {
    const threat = candidates
      .map((point) => ({ point, score: scoreFor(board, point, AI) + scoreFor(board, point, HUMAN) * 1.1 }))
      .sort((a, b) => b.score - a.score)[0]

    return threat.point
  }

  return bestByScore(board, candidates, 1.35)
}
