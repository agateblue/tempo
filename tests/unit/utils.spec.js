import { expect } from 'chai'
import {
  parseTags,
  getNewEntryData,
  insertTagMarkup,
  parseQuery,
  matchTokens,
  getFrontMatter,
  parseFrontMatter,
  quoteFrontMatter
} from '@/utils'

describe('utils', () => {
  it('can extract tags from text', () => {
    const msg = 'Today was quite +++happy, but I feel ~tired and --anxious because of #work. @work:duration=8'
    const expected = [
      {text: "+++happy", id: "happy", type: "feeling", mood: 3, sign: '+'},
      {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
      {text: "--anxious", id: "anxious", type: "feeling", mood: -2, sign: '-'},
      {text: "#work", id: "work", type: "tag", mood: null, sign: '#'},
      {text: "@work:duration=8", id: "work:duration", type: "annotation", mood: null, sign: '@', value: "8"},
    ]
    expect(parseTags(msg)).to.deep.equal(expected)
  })
  it('can get entry data', () => {
    const msg = 'Today was quite +happy, but I feel ~tired because of #work.'
    const expected = {
      type: 'entry',
      event: null,
      data: null,
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
    const expected = `Today was quite [+happy](/?q=tag:happy){.internal-link data-query="tag:happy"}, but I feel [~tired](/?q=tag:tired){.internal-link data-query="tag:tired"} because of [#work](/?q=tag:work){.internal-link data-query="tag:work"}.`
    const result = insertTagMarkup(msg)
    expect(result).to.deep.equal(expected)
  })
  it('parse query', () => {
    const query = 'hello #world + - date:2020 t:mytag'
    const expected = [
      {text: 'hello'},
      {tag: '#world'},
      {sign: '+'},
      {sign: '-'},
      {date: '2020'},
      {tagName: 'mytag'},
    ]
    const result = parseQuery(query)
    expect(result).to.deep.equal(expected)
  })
  it('match tokens true', () => {
    const tokens = [
      {text: 'hello'},
      {tagName: 'foo'},
      {sign: '+'},
    ]
    const entry = {
      text: 'this is hello world',
      tags: [
        {text: "+happy", id: "happy", type: "feeling", mood: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
        {text: "--foo", id: "foo", type: "feeling", mood: 0, sign: '-'},
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

  it('get front matter', () => {
    let entry = `event: id\nfield: value\n---
    This is the entry text
    `
    let expected = 'event: id\nfield: value'
    const result = getFrontMatter(entry)
    expect(result).equal(expected)
  })
  it('parse front matter', () => {
    let entry = `event: id\nfield: value`
    let expected = {event: 'id', field: 'value'}
    const result = parseFrontMatter(entry)
    expect(result).deep.equal(expected)
  })
  it('get entry data with front matter', () => {
    const msg = `event: hello\nfoo: bar\namount: 10\n---\nToday was quite +happy, but I feel ~tired because of #work.`
    const expected = {
      type: 'entry',
      tags: [
        {text: "+happy", id: "happy", type: "feeling", mood: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
        {text: "#work", id: "work", type: "tag", mood: null, sign: '#'},
      ],
      text: msg,
      event: 'hello',
      data: {
        foo: 'bar',
        amount: 10,
      },
      mood: 1
    }
    expect(getNewEntryData(msg)).to.deep.equal(expected)
  })

  it('get entry data with invalid matter', () => {
    const msg = `- event: hello\n- foo: bar\n- amount: 10\n---\nToday was quite +happy, but I feel ~tired because of #work.`
    const expected = {
      type: 'entry',
      event: null,
      data: null,
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
  it('quote front matter', () => {
    const msg = `event: hello\nfoo: bar\namount: 10\n---\nToday was quite +happy, but I feel ---tired because of #work.`
    const expected = '```\nevent: hello\nfoo: bar\namount: 10\n```\nToday was quite +happy, but I feel ---tired because of #work.'
    expect(quoteFrontMatter(msg)).to.deep.equal(expected)
  })
})
