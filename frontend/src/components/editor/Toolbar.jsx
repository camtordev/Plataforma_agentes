"use client"
import { useSimulation } from "../../context/SimulationContext"
import { useSocket } from "../../hooks/useSocket"

const Toolbar = () => {
  const { isRunning, setIsRunning, speed, setSpeed, code } = useSimulation()
  const { sendMessage } = useSocket()

  const handlePlay = () => {
    if (!isRunning) {
      // Send code to server
      sendMessage({
        type: "SET_AGENT_CODE",
        agent_id: "agent_default",
        code: code,
      })

      sendMessage({ type: "START_SIMULATION" })
      setIsRunning(true)
    }
  }

  const handlePause = () => {
    sendMessage({ type: "STOP_SIMULATION" })
    setIsRunning(false)
  }

  const handleReset = () => {
    sendMessage({
      type: "RESET",
      width: 20,
      height: 20,
    })
    setIsRunning(false)
  }

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed)
    sendMessage({ type: "SET_SPEED", speed: newSpeed })
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-zinc-900 border-b border-zinc-800">
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>▶</span> Play
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>⏸</span> Pause
          </button>
        )}

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <span>⏹</span> Reset
        </button>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <span className="text-sm text-zinc-400">Speed:</span>
        <select
          value={speed}
          onChange={(e) => handleSpeedChange(Number.parseFloat(e.target.value))}
          className="bg-zinc-800 text-white px-3 py-1 rounded border border-zinc-700"
        >
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1.0}>1x</option>
          <option value={2.0}>2x</option>
          <option value={5.0}>5x</option>
          <option value={10.0}>10x</option>
        </select>
      </div>
    </div>
  )
}

export default Toolbar