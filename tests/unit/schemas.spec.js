import { expect } from 'chai'
import { blueprintValidator } from '@/validation';


describe('schemas', () => {
  it(`can validate mood blueprint`, () => {
    const blueprint = require('@/blueprints/builtin:mood.json')
    let result = blueprintValidator.validate(blueprint);
    expect(result).to.deep.equal({valid: true, errors: []})
  })
  it(`can validate tags blueprint`, () => {
    const blueprint = require('@/blueprints/builtin:tags.json')
    let result = blueprintValidator.validate(blueprint);
    expect(result).to.deep.equal({valid: true, errors: []})
  })
  it(`can validate travel blueprint`, () => {
    const blueprint = require('@/blueprints/example:pets.json')
    let result = blueprintValidator.validate(blueprint);
    expect(result).to.deep.equal({valid: true, errors: []})
  })
  it(`fails on invalid blueprint`, () => {
    const blueprint = {
      foo: 'bar'
    }
    let result = blueprintValidator.validate(blueprint);
    expect(result.valid).to.equal(false)
  })
})
