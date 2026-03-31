import { useRef, useState, useEffect } from 'react'

export default function SignatureCanvas({ onConfirm, onCancel }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1f2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startDraw(e) {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    setDrawing(true)
    setHasDrawn(true)
  }

  function draw(e) {
    e.preventDefault()
    if (!drawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function endDraw() {
    setDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#1a1f2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  return (
    <div>
      <p style={styles.instructions}>Sign below using your finger or mouse</p>

      <canvas
        ref={canvasRef}
        width={340}
        height={180}
        style={styles.canvas}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        data-testid="signature-canvas"
        aria-label="Signature pad"
      />

      <div style={styles.actions}>
        <button
          onClick={clearCanvas}
          style={styles.clearBtn}
          className="btn btn-secondary"
          data-testid="clear-signature"
        >
          Clear
        </button>
        <button
          onClick={onCancel}
          style={styles.cancelBtn}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!hasDrawn}
          className={`btn ${hasDrawn ? 'btn-primary' : 'btn-disabled'}`}
          data-testid="confirm-signature"
          style={{ flex: 1 }}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

const styles = {
  instructions: {
    color: '#9aa0b4',
    fontSize: '14px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  canvas: {
    width: '100%',
    height: '180px',
    borderRadius: '8px',
    border: '1px solid #3a4055',
    cursor: 'crosshair',
    touchAction: 'none',
    display: 'block',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  clearBtn: {
    flex: 0,
    minWidth: '80px',
  },
  cancelBtn: {
    flex: 0,
    minWidth: '80px',
  },
}
