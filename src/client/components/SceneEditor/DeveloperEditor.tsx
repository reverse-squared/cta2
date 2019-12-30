import React, { useCallback } from 'react';
import { SceneEditorEditorProps } from './SceneEditor';
import { validateScene } from '../../../shared/validateScene';
import { Scene } from '../../../shared/types';
import { blankScene } from './blankScene';
import { TextareaChangeEvent } from '../../type-shorthand';

function MetadataEditor({ code, onCodeChange, meta, onMetaChange }: SceneEditorEditorProps) {
  const handlePublish = useCallback(() => {
    if (prompt('Type "YES!", all capitals, to publish your edit.') === 'YES!') {
      meta.publish = true;
      onMetaChange(meta);
    }
  }, []);

  const reset = useCallback(() => {
    onCodeChange(blankScene);
  }, []);

  let scene: Scene;
  let error: any;
  try {
    scene = validateScene(JSON.parse(code));
  } catch (e) {
    error = e;
    scene = null as any;
  }

  if (!scene) {
    return (
      <div className='veditor-scroll'>
        <div className='veditor'>
          <h1>Error in Scene Formatting</h1>
          <pre className='ftm-blockCode'>{error.message || error}</pre>
          <a className='link' href='#' onClick={reset}>
            Reset your scene (Discards information)
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className='veditor-scroll'>
      <div className='veditor'>
        <h1>Developer</h1>
        <p>
          Your scene id is <span className='ftm-code'>{meta.sceneEditorId}</span>
        </p>
        <p className='helper-text'>Make sure you abide by the contributing rules:</p>
        <ol>
          <li className='helper-text'>Do not include periods at the end of scene options.</li>
          <li className='helper-text'>Do not include racial slurs anywhere in your scene.</li>
          <li className='helper-text'>Do not include spoilers to any TV shows or movies.</li>
          <li className='helper-text'>
            Do not include personal information (e.g. emails, addresses, IP addresses, etc...) of
            you or others.
          </li>
          <li className='helper-text'>Please try not to make so many "You Died" endings.</li>
        </ol>
        <br />
        <br />
        <p className='helper-text'>
          Remember, you can control the <strong>LIVE DATABASE</strong>, and your edit will{' '}
          <strong>NOT</strong> go through the voting process. Great Power Comes Great
          Responsibility.
        </p>
        <p className='helper-text'>Oh yeah, this part is what your developer password is for.</p>

        <button
          onClick={handlePublish}
          style={{ fontSize: '30px', padding: '20px', display: 'block', margin: 'auto' }}
        >
          <b>PUBLISH EDIT</b>
        </button>
      </div>
    </div>
  );
}

export default MetadataEditor;
