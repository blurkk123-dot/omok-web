import type { Board, ForbiddenResult, Point, Stone } from '../types'

export const BOARD_SIZE = 15

const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
] as const

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array<Cell>(BOARD_SIZE).fill(null))
}

type Cell = Stone | null

export function isInside(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

export function placeStone(board: Board, point: Point, stone: Stone): Board {
  const next = cloneBoard(board)
  next[point.row][point.col] = stone
  return next
}

export function isFull(board: Board): boolean {
  return board.every((row) => row.every(Boolean))
}

function countDirection(board: Board, point: Point, stone: Stone, dr: number, dc: number): number {
  let count = 0
  let row = point.row + dr
  let col = point.col + dc

  while (isInside(row, col) && board[row][col] === stone) {
    count += 1
    row += dr
    col += dc
  }

  return count
}

export function lineLength(board: Board, point: Point, stone: Stone, dr: number, dc: number): number {
  return (
    1 +
    countDirection(board, point, stone, dr, dc) +
    countDirection(board, point, stone, -dr, -dc)
  )
}

export function hasExactFive(board: Board, point: Point, stone: Stone): boolean {
  return DIRECTIONS.some(([dr, dc]) => lineLength(board, point, stone, dr, dc) === 5)
}

export function hasOverline(board: Board, point: Point, stone: Stone): boolean {
  return DIRECTIONS.some(([dr, dc]) => lineLength(board, point, stone, dr, dc) >= 6)
}

function getWindow(board: Board, point: Point, stone: Stone, dr: number, dc: number): string {
  let value = ''

  for (let offset = -5; offset <= 5; offset += 1) {
    const row = point.row + dr * offset
    const col = point.col + dc * offset

    if (!isInside(row, col)) {
      value += 'B'
    } else if (board[row][col] === stone) {
      value += 'X'
    } else if (board[row][col] === null) {
      value += '.'
    } else {
      value += 'O'
    }
  }

  return value
}

function countMatches(line: string, patterns: RegExp[]): number {
  const hits = new Set<string>()

  for (const pattern of patterns) {
    for (let index = 0; index < line.length; index += 1) {
      const fragment = line.slice(index)
      const match = fragment.match(pattern)
      if (match?.index === 0) {
        hits.add(`${index}:${match[0]}`)
      }
    }
  }

  return hits.size
}

function countOpenThrees(board: Board, point: Point, stone: Stone): number {
  let total = 0

  for (const [dr, dc] of DIRECTIONS) {
    const line = getWindow(board, point, stone, dr, dc)

    /*
     * 33 금지는 흑돌 착수 후 서로 다른 두 방향 이상에서 열린 3이 생기는 경우다.
     * 열린 3은 양 끝이 비어 있고 한 수를 더 두면 열린 4로 확장될 수 있는 형태로 본다.
     * 연속 3(.XXX.)과 한 칸 점프가 있는 3(.XX.X., .X.XX.)을 모두 포함한다.
     */
    if (countMatches(line, [/\.XXX\./, /\.XX\.X\./, /\.X\.XX\./]) > 0) {
      total += 1
    }
  }

  return total
}

export function countFourThreats(board: Board, point: Point, stone: Stone): number {
  let total = 0

  for (const [dr, dc] of DIRECTIONS) {
    const line = getWindow(board, point, stone, dr, dc)

    /*
     * 44 금지는 흑돌 착수 후 열린 4 또는 한쪽이 막혀도 다음 수로 정확한 5목을
     * 만들 수 있는 4 위협이 둘 이상 생기는 경우다. 여기서는 6칸 안의 대표 패턴을
     * 세어 방향별 위협 개수를 계산한다. 장목은 별도 금수로 먼저 판정한다.
     */
    if (countMatches(line, [/\.XXXX\./, /OXXXX\./, /\.XXXXO/, /XXX\.X/, /XX\.XX/, /X\.XXX/]) > 0) {
      total += 1
    }
  }

  return total
}

export function getForbiddenResult(board: Board, point: Point): ForbiddenResult {
  const testBoard = placeStone(board, point, 'black')
  const reasons: ForbiddenResult['reasons'] = []

  /*
   * 금수는 흑돌에게만 적용한다. 실제 착수 결과를 가정한 보드에서 장목, 33, 44를
   * 순서대로 검사해 UI와 AI가 같은 규칙 함수를 공유할 수 있게 한다.
   */
  if (hasOverline(testBoard, point, 'black')) {
    reasons.push('overline')
  }

  if (countOpenThrees(testBoard, point, 'black') >= 2) {
    reasons.push('double-three')
  }

  if (countFourThreats(testBoard, point, 'black') >= 2) {
    reasons.push('double-four')
  }

  return {
    forbidden: reasons.length > 0,
    reasons,
  }
}

export function getCandidates(board: Board, radius = 2): Point[] {
  const occupied: Point[] = []

  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell) occupied.push({ row: rowIndex, col: colIndex })
    })
  })

  if (occupied.length === 0) {
    return [{ row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) }]
  }

  const seen = new Set<string>()
  const candidates: Point[] = []

  for (const stone of occupied) {
    for (let dr = -radius; dr <= radius; dr += 1) {
      for (let dc = -radius; dc <= radius; dc += 1) {
        const row = stone.row + dr
        const col = stone.col + dc
        const key = `${row},${col}`

        if (isInside(row, col) && !board[row][col] && !seen.has(key)) {
          seen.add(key)
          candidates.push({ row, col })
        }
      }
    }
  }

  return candidates
}

export function describeForbidden(result: ForbiddenResult): string {
  const labels: Record<string, string> = {
    'double-three': '33 금지',
    'double-four': '44 금지',
    overline: '장목 금지',
  }

  return result.reasons.map((reason) => labels[reason]).join(', ')
}
