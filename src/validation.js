import { Validator } from '@cfworker/json-schema';

export const blueprintSchema = require('@/schemas/blueprint.json')

export const blueprintValidator = new Validator(blueprintSchema);
