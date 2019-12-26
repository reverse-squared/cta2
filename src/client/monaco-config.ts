import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import schema from '../../scene.schema.json';

monaco.editor.defineTheme('cta', {
  base: 'vs-dark',
  inherit: true,
  rules: [{ background: '#191b1b', token: '#ffffff' }],
  colors: {
    'editor.background': '#23302b',
    'editorIndentGuide.background': '#384f48',
  },
});

export const modelUri = monaco.Uri.parse(
  'a://b/' +
    Math.random()
      .toString()
      .substr(2) +
    '.json'
); // a made up unique URI for our model

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  schemas: [
    {
      uri: `${location.protocol}//${location.host}/scene.schema.json`, // id of the first schema
      fileMatch: [modelUri.toString()], // associate with our model
      schema: schema,
    },
  ],
});
