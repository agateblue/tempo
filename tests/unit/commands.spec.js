import { expect } from 'chai'
import {
  parseCommand,
} from '@/commands'

describe('commands', () => {
  it('can parse command', () => {
    const msg = '/annotate sleep 10 start "10 am"'
    const expected = {
      "text": msg,
      "command": "annotate",
      "body": 'sleep 10 start "10 am"'
    }
    expect(parseCommand(msg)).to.deep.equal(expected)
  })
  it('can parse command no body', () => {
    const msg = '/annotate'
    const expected = {
      "text": msg,
      "command": "annotate",
      "body": ''
    }
    expect(parseCommand(msg)).to.deep.equal(expected)
  })
})
