import { expect } from 'chai'
import {parseTags, getNewEntryData} from '@/utils'

describe('utils', () => {
  it('can extract tags from text', () => {
    const msg = 'Today was quite +happy, but I feel ~tired because of #work.'
    const expected = [
      {text: "+happy", id: "happy", type: "feeling", effect: 1, sign: '+'},
      {text: "~tired", id: "tired", type: "feeling", effect: 0, sign: '~'},
      {text: "#work", id: "work", type: "tag", effect: null, sign: '#'},
    ]
    expect(parseTags(msg)).to.deep.equal(expected)
  })
  it('can get entry data', () => {
    const msg = 'Today was quite +happy, but I feel ~tired because of #work.'
    const expected = {
      type: 'entry',
      tags: [
        {text: "+happy", id: "happy", type: "feeling", effect: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", effect: 0, sign: '~'},
        {text: "#work", id: "work", type: "tag", effect: null, sign: '#'},
      ],
      text: msg,
      effect: 1
    }
    expect(getNewEntryData(msg)).to.deep.equal(expected)
  })
})
