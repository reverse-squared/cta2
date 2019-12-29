import React, { useCallback } from 'react';
import { SceneEditorEditorProps } from './SceneEditor';

function MetadataEditor({ code, onCodeChange, meta, onMetaChange }: SceneEditorEditorProps) {
  const handlePublish = useCallback(() => {
    meta.publish = true;
    onMetaChange(meta);
  }, []);

  return (
    <div className='veditor-scroll'>
      <div className='veditor'>
        <h1>Finish and Publish</h1>
        <p>
          Your scene id is <span className='ftm-code'>{'yes'}</span>
        </p>
        <h2>Comments (Optional)</h2>
        <p className='helper-text'>
          Write a note to the game moderators who could fill in any missing logic or links in your
          scene. This note is only visible to the game moderators.
        </p>
        <textarea rows={8} />

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
