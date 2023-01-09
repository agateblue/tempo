import { expect } from 'chai'
import {
  parseTags,
  getNewEntryData,
  insertTagMarkup,
  parseFullQuery,
  parseQuery,
  matchTokens,
  matchOrTokens,
  getCompleteEntry,
  getWeekNumber,
} from '@/utils'

describe('utils', () => {
  it('can extract tags from text', () => {
    const msg = 'Today was quite +++happy, but I feel ~tired and ---anxious because of #work. @work:duration=8. @a was mean.'
    const expected = [
      {text: "+++happy", id: "happy", type: "feeling", mood: 3, sign: '+'},
      {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
      {text: "---anxious", id: "anxious", type: "feeling", mood: -3, sign: '-'},
      {text: "#work", id: "work", type: "tag", mood: null, sign: '#'},
      {text: "@work:duration=8", id: "work:duration", type: "annotation", mood: null, sign: '@', value: "8"},
      {text: "@a", id: "a", type: "annotation", mood: null, sign: '@', value: null},
    ]
    expect(parseTags(msg)).to.deep.equal(expected)
  })
  it('can extract tags from text edge cases', () => {
    
    let cases = [
      ['--', []],
      ['--boui-boui', [{
        id: 'boui-boui',
        sign: '-',
        mood: -2,
        text: '--boui-boui',
        type: 'feeling'
      }]],
      ['@weight:variation=-12', [{
        id: 'weight:variation',
        sign: '@',
        mood: null,
        text: '@weight:variation=-12',
        value: '-12',
        type: 'annotation'
      }]],
    ]
    cases.forEach(row => {
      expect(parseTags(row[0])).to.deep.equal(row[1])
    })
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
      mood: 1,
      favorite: false,
      replies: [],
      thread: null,
      form: null,
    }
    expect(getNewEntryData(msg)).to.deep.equal(expected)
  })
  it("can get entry data with additional values", () => {
    const msg = "Today was quite good";
    const expected = {
      type: "entry",
      data: null,
      tags: [],
      text: msg,
      mood: 0,
      favorite: false,
      replies: ['bar'],
      thread: 'foo',
      form: null,
    };
    expect(getNewEntryData(msg, {thread: 'foo', replies: ['bar']})).to.deep.equal(expected);
  });
  it('can get entry data with annotations', () => {
    const msg = '@work:duration=8.5, @work:project="tempo stuff" @work:lunch=true @work:perf=-12'
    const expected = {
      type: 'entry',
      data: {'work:duration': '8.5', 'work:project': 'tempo stuff', 'work:lunch': 'true', 'work:perf': '-12'},
      tags: [
        {text: "@work:duration=8.5", id: "work:duration", type: "annotation", mood: null, sign: '@', value: "8.5"},
        {text: '@work:project="tempo stuff"', id: "work:project", type: "annotation", mood: null, sign: '@', value: "tempo stuff"},
        {text: "@work:lunch=true", id: "work:lunch", type: "annotation", mood: null, sign: '@', value: "true"},
        {text: "@work:perf=-12", id: "work:perf", type: "annotation", mood: null, sign: '@', value: "-12"},
      ],
      text: msg,
      mood: 0,
      favorite: false,
      replies: [],
      thread: null,
      form: null,
    }
    expect(getNewEntryData(msg)).to.deep.equal(expected)
  })
  it('insert tag markup', () => {
    const msg = 'Today was quite +happy, but I feel ~tired because of #work.'
    const expected = `Today was quite [+happy](/?q=tag:happy){.internal-link data-query="tag:happy"}, but I feel [~tired](/?q=tag:tired){.internal-link data-query="tag:tired"} because of [#work](/?q=tag:work){.internal-link data-query="tag:work"}.`
    const result = insertTagMarkup(msg)
    expect(result).to.deep.equal(expected)
  })
  it('parse full query', () => {
    const query = 'hello, world'
    const expected = [
      [{text: 'hello'}],
      [{text: 'world'}],
    ]
    const result = parseFullQuery(query)
    expect(result).to.deep.equal(expected)
  })
  it('parse query', () => {
    const query = 'is:fav is:thread is:reply is:form form:noop:form hello #world + - date:2020 t:mytag $dreams'
    const expected = [
      {favorite: true},
      {thread: true},
      {reply: true},
      {form: true},
      {formId: 'noop:form'},
      {text: 'hello'},
      {tagName: 'world', sign: '#'},
      {sign: '+'},
      {sign: '-'},
      {date: '2020'},
      {tagName: 'mytag'},
      {alias: 'dreams'},
    ]
    const result = parseQuery(query)
    expect(result).to.deep.equal(expected)
  })
  it('match tokens true', () => {
    const tokens = [
      {text: 'hello'},
      {text: 'fieldContent'},
      {text: 'formName'},
      {text: 'fieldName'},
      {tagName: 'foo'},
      {sign: '+'},
    ]
    const entry = {
      text: 'this is hello world',
      tags: [
        {text: "+happy", id: "happy", type: "feeling", mood: 1, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
        {text: "--foo", id: "foo", type: "feeling", mood: 0, sign: '-'},
      ],
      form: 'formName',
      data: {
        field1: 'fieldContent',
        fieldName: 'noop'
      }
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
  it('match favorite', () => {
    const tokens = [
      {favorite: true},
    ]
    const entryFav = {
      text: 'this is hello world',
      favorite: true,
    }
    const entryNotFav = {
      text: 'this is hello world',
      favorite: false,
    }
    let result = matchTokens(entryFav, tokens)
    expect(result).equal(true)
    result = matchTokens(entryNotFav, tokens)
    expect(result).equal(false)
  })
  it('match thread', () => {
    const tokens = [
      {thread: true},
    ]
    const entryMatching = {
      text: 'noop',
      replies: ['foo'],
    }
    const entryNotMatching = {
      text: 'bar',
      replies: [],
    }
    let result = matchTokens(entryMatching, tokens)
    expect(result).equal(true)
    result = matchTokens(entryNotMatching, tokens)
    expect(result).equal(false)
  })
  it('match reply', () => {
    const tokens = [
      {reply: true},
    ]
    const entryMatching = {
      text: 'noop',
      thread: 'foo',
    }
    const entryNotMatching = {
      text: 'bar',
      replies: null,
    }
    let result = matchTokens(entryMatching, tokens)
    expect(result).equal(true)
    result = matchTokens(entryNotMatching, tokens)
    expect(result).equal(false)
  })
  it('match form', () => {
    const tokens = [
      {form: true},
    ]
    const entryMatching = {
      text: 'noop',
      form: 'foo'
    }
    const entryNotMatching = {
      text: 'bar',
      form: null,
    }
    let result = matchTokens(entryMatching, tokens)
    expect(result).equal(true)
    result = matchTokens(entryNotMatching, tokens)
    expect(result).equal(false)
  })
  it('match formId', () => {
    const tokens = [
      {formId: 'foo:form'},
    ]
    const entryMatching = {
      text: 'noop',
      form: 'foo:form'
    }
    const entryNotMatching = {
      text: 'bar',
      form: 'bar:form',
    }
    let result = matchTokens(entryMatching, tokens)
    expect(result).equal(true)
    result = matchTokens(entryNotMatching, tokens)
    expect(result).equal(false)
  })
  it('match tokens aliases true', () => {
    let aliases = {
      dreams: "nightmare, dream"
    }
    const tokens = [
      {alias: 'dreams'},
    ]
    const entry = {
      text: 'nightmare tonight',
      tags: []
    }
    const result = matchTokens(entry, tokens, aliases)
    expect(result).equal(true)
  })
  it('match tokens aliases false', () => {
    let aliases = {
      dreams: "foo"
    }
    const tokens = [
      {alias: 'dreams'},
    ]
    const entry = {
      text: 'nightmare tonight',
      tags: []
    }
    const result = matchTokens(entry, tokens, aliases)
    expect(result).equal(false)
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
  it('match or tokens', () => {
    const tokens = [
      [{sign: '-'}],
      [{text: 'noop'}],
    ]
    const entry = {
      text: 'sad',
      tags: [
        {text: "-tired", id: "tired", type: "feeling", mood: 0, sign: '-'},
      ]
    }
    const result = matchOrTokens(entry, tokens)
    expect(result).equal(true)
  })
  it('getCompleteEntry', () => {
    let date = new Date()
    const entry = {
      _id: 'id',
      _rev: 'rev',
      text: "hello",
      favorite: false,
      mood: 3,
      date: date.toISOString(),
      tags: [
        {text: "+++happy", id: "happy", type: "feeling", mood: 3, sign: '+'},
        {text: "~tired", id: "tired", type: "feeling", mood: 0, sign: '~'},
        {text: "@work:duration=8.5", id: "work:duration", type: "annotation", mood: null, sign: '@', value: "8.5"},
      ],
      data: {
        'work:duration': "8.5"
      },
      thread: 'foo',
      replies: ['bar'],
      form: 'foo:form',
    }
    const expected = {
      ...entry,
      data: {
        'work:duration': 8.5,
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
          text: "@work:duration=8.5",
          type: "annotation",
          value: "8.5",
        },
      },
      favorite: false,
      thread: 'foo',
      replies: ['bar'],
      form: 'foo:form',
    }
    expected.week = `${expected.year}-${expected.weeknumber}`
    const result = getCompleteEntry(entry)
    expect(result).to.deep.equal(expected)
  })
  // it('sortChain', () => {
  //   const entries = [
  //     {id: "d", nextId: "e", previousId: "c"},
  //     {id: "c"},
  //     {id: "a", nextId: "c", previousId: null},
  //     {id: "b", nextId: "c", previousId: null},
  //     {id: "e", nextId: null, previousId: "d"},
  //   ]
  //   const expected = [
  //     {id: "a", nextId: "c", previousId: null},
  //     {id: "b", nextId: "c", previousId: null},
  //     {id: "c"},
  //     {id: "d", nextId: "e", previousId: "c"},
  //     {id: "e", nextId: null, previousId: "d"},
  //   ]
  //   const result = sortChained(entries)
  //   expect(result).deep.equal(expected)
  // })

})
