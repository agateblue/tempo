import { expect } from 'chai'
import {
  parseTags,
  getNewEntryData,
  insertTagMarkup,
  parseQuery,
  matchTokens,
  getCompleteEntry,
  getWeekNumber,
} from '@/utils'

describe('utils', () => {
  it('can extract tags from text', () => {
    const msg = 'Today was quite +++happy, but I feel ~tired and --anxious because of #work. @work:duration=8. @a was mean.'
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
  it('can get entry data with annotations', () => {
    const msg = 'Today was quite +++happy, but I feel ~tired and --anxious because of #work. @work:duration=8'
    const expected = {
      type: 'entry',
      data: {'work:duration': '8'},
      tags: [
        {text: "+++happy", id: "happy", type: "feeling", mood: 3, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
        {text: "--anxious", id: "anxious", type: "feeling", mood: -2, sign: '-'},
        {text: "#work", id: "work", type: "tag", mood: null, sign: '#'},
        {text: "@work:duration=8", id: "work:duration", type: "annotation", mood: null, sign: '@', value: "8"},
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
  it('getCompleteEntry', () => {
    let date = new Date()
    const entry = {
      _id: 'id',
      _rev: 'rev',
      text: "hello",
      mood: 3,
      date: date.toISOString(),
      tags: [
        {text: "+++happy", id: "happy", type: "feeling", mood: 3, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
        {text: "@work:duration=8", id: "work:duration", type: "annotation", mood: null, sign: '@', value: "8"},
      ],
      data: {
        'work:duration': "8"
      }
    }
    const expected = {
      ...entry,
      data: {
        'work:duration': 8,
      },
      fullDate: date,
      date: date.toISOString().split('T')[0],
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: date.getDay() + 1,
      weeknumber: getWeekNumber(date),
      tags: {
        "happy": {
          id: "happy",
          mood: 3,
          present: true,
          sign: "+",
          text: "+++happy",
          type: "feeling",
        },
        "tired": {
          id: "tired",
          mood: 0,
          present: true,
          sign: "~",
          text: "~tired",
          type: "feeling",
        },
        "work:duration": {
          id: "work:duration",
          mood: null,
          present: true,
          sign: "@",
          text: "@work:duration=8",
          type: "annotation",
          value: "8",
        }
      }
    }
    expected.week = `${expected.year}-${expected.weeknumber}`
    const result = getCompleteEntry(entry)
    expect(result).to.deep.equal(expected)
  })

})
