import { expect } from 'chai'
import {parseTags, getNewEntryData, insertTagMarkup, parseQuery, matchTokens} from '@/utils'

describe('utils', () => {
  it('can extract tags from text', () => {
    const msg = 'Today was quite +++happy, but I feel ~tired and --anxious because of #work.'
    const expected = [
      {text: "+++happy", id: "happy", type: "feeling", mood: 3, sign: '+'},
      {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
      {text: "--anxious", id: "anxious", type: "feeling", mood: -2, sign: '-'},
      {text: "#work", id: "work", type: "tag", mood: null, sign: '#'},
    ]
    expect(parseTags(msg)).to.deep.equal(expected)
  })
  it('can get entry data', () => {
    const msg = 'Today was quite +happy, but I feel ~tired because of #work.'
    const expected = {
      type: 'entry',
      tags: [
        {text: "+happy", id: "happy", type: "feeling", mood: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
        {text: "#work", id: "work", type: "tag", mood: null, sign: '#'},
      ],
      text: msg,
      mood: 1
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
    const query = 'hello #world + - @2020'
    const expected = [
      {text: 'hello'},
      {tag: '#world'},
      {sign: '+'},
      {sign: '-'},
      {date: '2020'},
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
        {text: "+happy", id: "happy", type: "feeling", mood: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
      ]
    }
    const result = matchTokens(entry, tokens)
    expect(result).equal(true)
  })
  it('match tokens date true', () => {
    const tokens = [
      {date: '2020'},
    ]
    const entry = {
      text: 'this is hello world',
      _id: "2020-02-01",
      tags: []
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
        {text: "+happy", id: "happy", type: "feeling", mood: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
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
        {text: "-tired", id: "tired", type: "feeling", mood: 0, sign: '-'},
      ]
    }
    const result = matchTokens(entry, tokens)
    expect(result).equal(true)
  })
})
