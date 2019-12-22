import React from 'react';
import { FancyTextMakerString } from '../shared/types';

interface FancyTextProps {
  text: FancyTextMakerString;
}

function FancyText({ text }: FancyTextProps) {
  return <>{text}</>;
}

export default FancyText;
