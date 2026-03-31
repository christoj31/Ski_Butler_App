import Modal from '../common/Modal'
import SignatureCanvas from '../common/SignatureCanvas'

const WAIVER_TEXT = `RELEASE OF LIABILITY AND ASSUMPTION OF RISK

By signing below, I acknowledge that skiing and snowboarding involve inherent risks including serious injury or death. I voluntarily assume all such risks and release Ski Butlers, its employees, agents, and affiliates from any and all liability for injuries or damages arising from equipment rental.

I confirm that I have disclosed any medical conditions that may affect my ability to safely use this equipment. I agree to use the equipment only as intended and to return it in the same condition.

This release is binding on myself, my heirs, and my estate.`

export default function WaiverModal({ isOpen, onClose, onSign, renterName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Waiver — ${renterName}`}>
      <div style={styles.container} data-testid="waiver-modal-content">
        <div style={styles.waiverText}>
          {WAIVER_TEXT}
        </div>

        <SignatureCanvas
          onConfirm={onSign}
          onCancel={onClose}
        />
      </div>
    </Modal>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  waiverText: {
    backgroundColor: '#1a1f2e',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '12px',
    color: '#9aa0b4',
    lineHeight: '1.7',
    whiteSpace: 'pre-line',
    maxHeight: '180px',
    overflowY: 'auto',
  },
}
