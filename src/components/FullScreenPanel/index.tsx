import React from "react";

type FullScreenPanelProps = {
  open: boolean,
  setOpen: (open: boolean) => void,
  children: React.ReactNode
}

const FullScreenPanel = ({ open, setOpen, children }: FullScreenPanelProps) => {
  return (
    <>
    { open &&
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, .5)',
          zIndex: 100
        }}
        onClick={() => setOpen(false)}
      >
        <div onClick={e => e.stopPropagation()}>
          { children }
        </div>
      </div>
    }
    </>
  )
}

export default FullScreenPanel;