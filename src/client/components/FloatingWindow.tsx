import React from 'react';
import '../css/floating-window.css';

export interface FloatingWindowProps {
  children: React.ReactChild;
}

function FloatingWindow({ children }: FloatingWindowProps) {
  return <div className='floating-window'>{children}</div>;
}

export default FloatingWindow;
