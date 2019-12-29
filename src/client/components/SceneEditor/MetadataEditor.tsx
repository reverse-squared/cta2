import React, { useCallback } from 'react';
import { SceneEditorEditorProps } from './SceneEditor';
import { validateScene } from '../../../shared/validateScene';
import { Scene } from '../../../shared/types';
import { blankScene } from './blankScene';
import { TextareaChangeEvent } from '../../type-shorthand';

function MetadataEditor({ code, onCodeChange, meta, onMetaChange }: SceneEditorEditorProps) {
  const handlePublish = useCallback(() => {
    meta.publish = true;
    onMetaChange(meta);
  }, []);
  const handleCommentChange = useCallback((ev: TextareaChangeEvent) => {
    meta.comment = ev.currentTarget.value;
    onMetaChange(meta);
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
        <h1>Finish and Publish</h1>
        <p>
          Your scene id is <span className='ftm-code'>{meta.sceneEditorId}</span>
        </p>
        <h2>Comments (Optional)</h2>
        <p className='helper-text'>
          Write a note to the game moderators who could fill in any missing logic or links in your
          scene. This note is only visible to the game moderators.
        </p>
        <textarea value={meta.comment} onChange={handleCommentChange} rows={8} />

        <br />
        <br />
        <br />

        <h2>Publish Suggestion</h2>
        <p className='helper-text'>make sure you follow contributing rules</p>
        <br />
        <p className='helper-text'>
          When you are ready, press the giant button to send it into voting.
        </p>

        <button
          onClick={handlePublish}
          style={{ fontSize: '30px', padding: '20px', display: 'block', margin: 'auto' }}
        >
          REQUEST
        </button>
      </div>
    </div>
  );
}

export default MetadataEditor;
