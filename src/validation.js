import { Validator } from '@cfworker/json-schema';

const blueprintSchema = require('@/schemas/blueprint.json')

export const blueprintValidator = new Validator(blueprintSchema);
