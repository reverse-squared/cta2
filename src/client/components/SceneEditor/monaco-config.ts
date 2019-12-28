import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import schema from '../../../../scene.schema.json';

monaco.editor.defineTheme('cta', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      token: 'string.key.json',
      foreground: '#64ed98',
    },
    {
      token: 'string.value.json',
      foreground: '#64bded',
    },
    {
      token: 'number.json',
      foreground: '#ed9464',
    },
    {
      token: 'keyword.json',
      foreground: '#ed9464',
    },
  ],
  colors: {
    'editor.background': '#23302b',
    'editorIndentGuide.background': '#384f48',
  },
});

// a made up unique URI for our model
export const modelUri = monaco.Uri.parse('cta://scene-editor.json');

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
