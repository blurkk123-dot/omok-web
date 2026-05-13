import { useMemo, useState } from 'react'
import './styles.css'
import { chooseAiMove } from './lib/ai'
import {
  BOARD_SIZE,
  createBoard,
  describeForbidden,
  getForbiddenResult,
  hasExactFive,
  isFull,
  placeStone,
} from './lib/omok'
import type { Board, Difficulty, GameStatus, Point } from './types'

const difficultyLabels: Record<Difficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
}

function statusLabel(status: GameStatus): string {
  if (status === 'black-win') return '흑돌 승리'
  if (status === 'white-win') return '백돌 승리'
  if (status === 'draw') return '무승부'
  return '진행 중'
}

function App() {
  const [board, setBoard] = useState<Board>(() => createBoard())
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [status, setStatus] = useState<GameStatus>('playing')
  const [message, setMessage] = useState('흑돌 차례입니다. 빈 교차점을 선택하세요.')
  const [lastMove, setLastMove] = useState<Point | null>(null)
  const [thinking, setThinking] = useState(false)

  const coordinates = useMemo(() => Array.from({ length: BOARD_SIZE }, (_, index) => index), [])

  const resetGame = (nextDifficulty = difficulty) => {
    setBoard(createBoard())
    setDifficulty(nextDifficulty)
    setStatus('playing')
    setMessage('새 게임을 시작했습니다. 흑돌 차례입니다.')
    setLastMove(null)
    setThinking(false)
  }

  const playAi = (currentBoard: Board) => {
    setThinking(true)

    window.setTimeout(() => {
      const aiMove = chooseAiMove(currentBoard, difficulty)
      const aiBoard = placeStone(currentBoard, aiMove, 'white')

      setBoard(aiBoard)
      setLastMove(aiMove)
      setThinking(false)

      if (hasExactFive(aiBoard, aiMove, 'white')) {
        setStatus('white-win')
        setMessage('AI가 정확히 5목을 완성했습니다.')
        return
      }

      if (isFull(aiBoard)) {
        setStatus('draw')
        setMessage('더 둘 곳이 없습니다. 무승부입니다.')
        return
      }

      setMessage('흑돌 차례입니다.')
    }, 260)
  }

  const handleCellClick = (row: number, col: number) => {
    if (status !== 'playing' || thinking || board[row][col]) return

    const point = { row, col }
    const forbidden = getForbiddenResult(board, point)

    if (forbidden.forbidden) {
      setMessage(`${describeForbidden(forbidden)}입니다. 흑돌은 그 자리에 둘 수 없습니다.`)
      return
    }

    const nextBoard = placeStone(board, point, 'black')
    setBoard(nextBoard)
    setLastMove(point)

    if (hasExactFive(nextBoard, point, 'black')) {
      setStatus('black-win')
      setMessage('정확히 5목을 완성했습니다. 흑돌 승리입니다.')
      return
    }

    if (isFull(nextBoard)) {
      setStatus('draw')
      setMessage('더 둘 곳이 없습니다. 무승부입니다.')
      return
    }

    setMessage('AI가 수를 계산하고 있습니다.')
    playAi(nextBoard)
  }

  return (
    <main className="app-shell">
      <section className="game-area" aria-label="오목 게임판">
        <div className="title-row">
          <div>
            <p className="eyebrow">Single Player Omok</p>
            <h1>오목</h1>
          </div>
          <div className="turn-pill">{thinking ? 'AI 생각 중' : statusLabel(status)}</div>
        </div>

        <div className="board-wrap">
          <div className="board" role="grid" aria-label="15x15 오목판">
            {coordinates.map((row) =>
              coordinates.map((col) => {
                const stone = board[row][col]
                const isLast = lastMove?.row === row && lastMove.col === col

                return (
                  <button
                    key={`${row}-${col}`}
                    className={`cell ${stone ? 'occupied' : ''} ${isLast ? 'last' : ''}`}
                    type="button"
                    role="gridcell"
                    aria-label={`${row + 1}행 ${col + 1}열${stone ? ` ${stone === 'black' ? '흑돌' : '백돌'}` : ''}`}
                    disabled={status !== 'playing' || thinking || Boolean(stone)}
                    onClick={() => handleCellClick(row, col)}
                  >
                    {stone && <span className={`stone ${stone}`} />}
                  </button>
                )
              }),
            )}
          </div>
        </div>
      </section>

      <aside className="side-panel">
        <section className="panel-section">
          <h2>게임 상태</h2>
          <p className="status-message">{message}</p>
          <dl className="meta-grid">
            <div>
              <dt>사용자</dt>
              <dd>흑돌</dd>
            </div>
            <div>
              <dt>AI</dt>
              <dd>백돌</dd>
            </div>
          </dl>
        </section>

        <section className="panel-section">
          <h2>난이도</h2>
          <div className="segmented" role="group" aria-label="난이도 선택">
            {(Object.keys(difficultyLabels) as Difficulty[]).map((level) => (
              <button
                key={level}
                className={difficulty === level ? 'active' : ''}
                type="button"
                onClick={() => resetGame(level)}
              >
                {difficultyLabels[level]}
              </button>
            ))}
          </div>
        </section>

        <button className="primary-button" type="button" onClick={() => resetGame()}>
          새 게임
        </button>

        <section className="panel-section rules">
          <h2>규칙</h2>
          <ul>
            <li>흑돌만 33, 44, 장목 금지가 적용됩니다.</li>
            <li>흑돌과 백돌 모두 정확히 5목일 때만 승리합니다.</li>
            <li>마지막 착수는 얇은 링으로 표시됩니다.</li>
          </ul>
        </section>
      </aside>
    </main>
  )
}

export default App
