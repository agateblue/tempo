import { expect } from 'chai'
import {parseTags, getNewEntryData, insertTagMarkup, parseQuery, matchTokens} from '@/utils'

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
  it('insert tag markup', () => {
    const msg = 'Today was quite +happy, but I feel ~tired because of #work.'
    const expected = `Today was quite <router-link :to="{name: 'Home', query: {q: '+happy'}}">+happy</router-link>, but I feel <router-link :to="{name: 'Home', query: {q: '~tired'}}">~tired</router-link> because of <router-link :to="{name: 'Home', query: {q: '#work'}}">#work</router-link>.`
    const result = insertTagMarkup(msg)
    expect(result).to.deep.equal(expected)
  })
  it('parse query', () => {
    const query = 'hello #world + -'
    const expected = [
      {text: 'hello'},
      {tag: '#world'},
      {sign: '+'},
      {sign: '-'},
    ]
    const result = parseQuery(query)
    expect(result).to.deep.equal(expected)
  })
  it('match tokens true', () => {
    const tokens = [
      {text: 'hello'},
      {sign: '+'},
    ]
    const entry = {
      text: 'this is hello world',
      tags: [
        {text: "+happy", id: "happy", type: "feeling", effect: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", effect: 0, sign: '~'},
      ]
    }
    const result = matchTokens(entry, tokens)
    expect(result).equal(true)
  })

  it('match tokens false', () => {
    const tokens = [
      {text: 'foo'},
      {sign: '+'},
    ]
    const entry = {
      text: 'this is hello world',
      tags: [
        {text: "+happy", id: "happy", type: "feeling", effect: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", effect: 0, sign: '~'},
      ]
    }
    const result = matchTokens(entry, tokens)
    expect(result).equal(false)
  })

  it('match tokens sign', () => {
    const tokens = [
      {sign: '-'},
    ]
    const entry = {
      text: 'text',
      tags: [
        {text: "-tired", id: "tired", type: "feeling", effect: 0, sign: '-'},
      ]
    }
    const result = matchTokens(entry, tokens)
    expect(result).equal(true)
  })
})
