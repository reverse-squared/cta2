const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const generateDefaults = require('json-schema-defaults');
const { validate } = require('jsonschema');

const schema = fs.readJsonSync(path.join(__dirname, '../../env.schema.json'));

try {
  const env = fs.readJsonSync(path.join(__dirname, '../../env.json'));
  const result = validate(env, schema);
  if (result.errors.length > 0) {
    console.log(chalk.redBright('Error in env.json:'));
    console.log();
    for (let i = 0; i < result.errors.length; i++) {
      const error = result.errors[i];

      console.log(chalk.redBright(error.stack.replace('instance', 'env')));

      process.exit(10);
    }
  }
} catch (error) {
  console.log(chalk.yellowBright('Error parsing env.json, generating a new one.'));
  fs.writeJsonSync(path.join(__dirname, '../../env.json'), generateDefaults(schema), { spaces: 2 });
}
