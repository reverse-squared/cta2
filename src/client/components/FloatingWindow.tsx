import React from 'react';
import Draggable from 'react-draggable';
import '../css/floating-window.css';

export interface FloatingWindowProps {
  children: React.ReactChild;
  title?: string;
  onClose?: () => void;
}

function FloatingWindow({ children, onClose, title = 'Floating Window' }: FloatingWindowProps) {
  return (
    <Draggable defaultClassName='floating-window' handle='.floating-window-drag-bar'>
      <div>
        <div className='floating-window-drag-bar'>
          <div className='floating-window-title'>{title}</div>
          {onClose && (
            <div className='floating-window-close-button' onClick={onClose}>
              X
            </div>
          )}
        </div>
        <div className='float-window-content'>{children}</div>
      </div>
    </Draggable>
  );
}

export default FloatingWindow;
