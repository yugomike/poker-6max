import { useGameStore } from './store/gameStore'
import { Table } from './components/Table'
import { PositionSelector } from './components/PositionSelector'
import { ActionInput } from './components/ActionInput'
import { ActionHistory } from './components/ActionHistory'
import { ActivePlayersRanges } from './components/PlayerRangePanel'
import { BoardInput } from './components/BoardInput'
import { SaveHandButton } from './components/SaveHandButton'
import { HandHistory } from './components/HandHistory'

function App() {
  const { heroPosition, actingPosition, board } = useGameStore()

  const isPreflopComplete = actingPosition === null
  const hasBoard = board.length >= 3

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Poker Range Analyzer
          </h1>
          <span className="text-sm text-gray-500">6-Max Cash</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {!heroPosition ? (
          /* Initial setup: Select position */
          <div className="max-w-md mx-auto mt-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-medium text-center mb-4">
                Start a New Hand
              </h2>
              <PositionSelector />
            </div>
          </div>
        ) : (
          /* Main game view */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Table + Actions */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <Table />
              </div>

              {/* Preflop actions or Board input */}
              {!isPreflopComplete ? (
                <div className="bg-gray-800 rounded-xl">
                  <ActionInput />
                </div>
              ) : (
                <div className="bg-gray-800 rounded-xl p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Board</h3>
                    <BoardInput />
                  </div>

                  {/* Save hand button */}
                  {hasBoard && (
                    <div className="pt-2 border-t border-gray-700">
                      <SaveHandButton />
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gray-800 rounded-xl">
                <ActionHistory />
              </div>

              {/* Hand History */}
              <div className="bg-gray-800 rounded-xl p-4">
                <HandHistory />
              </div>

              <div className="bg-gray-800 rounded-xl p-4">
                <PositionSelector />
              </div>
            </div>

            {/* Right columns: Ranges */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl p-4">
                <ActivePlayersRanges />

                {/* Legend when board is shown */}
                {hasBoard && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Distribution Legend</h4>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500" />
                        <span className="text-gray-400">Monsters (Sets+)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-lime-500" />
                        <span className="text-gray-400">Two Pair</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-yellow-500" />
                        <span className="text-gray-400">Top Pair</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-orange-500" />
                        <span className="text-gray-400">Middle Pair</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-red-500" />
                        <span className="text-gray-400">Weak Pair</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-blue-500" />
                        <span className="text-gray-400">Draws</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-gray-500" />
                        <span className="text-gray-400">Air</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 p-4 mt-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-600">
          Real-time GTO range analysis for 6-max cash games
        </div>
      </footer>
    </div>
  )
}

export default App
