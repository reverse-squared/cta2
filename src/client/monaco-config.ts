import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import schema from '../../scene.schema.json';

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
