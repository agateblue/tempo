import sortBy from 'lodash/sortBy'

const signToMood = {
  '+': 1,
  '-': -1,
  '~': 0,
  '?': null,
  '#': null,
  '!': null,
  '@': null,
}
const signToType = {
  '+': 'feeling',
  '-': 'feeling',
  '~': 'feeling',
  '?': 'feeling',
  '#': 'tag',
  '@': 'annotation',
}
const tagRegex = /(^|\s)((#|\+{1,5}|-{1,5}|~|\?|!|@)([:A-zÀ-ÿ\d-]+(=(true|false|[:A-zÀ-ÿ\d-]+|".*")?(-?\d*(\.(\d+))?)?)?))/gi

export function parseTags (text) {
  const tags = []
  const regex = new RegExp(tagRegex)
  let match = regex.exec(text);
  while (match != null) {
    let tag = {
      text: match[2],
      sign: match[3][0],
      id: match[4].replace(/"/g, ""),
    }
    let include = true
    tag.type = signToType[tag.sign]
    if (tag.type === 'annotation') {
      let parts = tag.id.replace(/"/g, "").split('=')
      tag.id = parts[0]
      tag.value = parts[1] || null
    }
    tag.mood = signToMood[tag.sign]
    if (tag.mood) {
      tag.mood = tag.mood * match[3].length
    }
    if (include) {
      tags.push(tag)
    }
    match = regex.exec(text)
  }
  return tags
}

export function insertTagMarkup (text) {
  try {
    return text.replace(tagRegex, (match, m1, m2, m3, m4) => {  // eslint-disable-line no-unused-vars
      return ` [${m2}](/?q=tag:${encodeURIComponent(m4)}){.internal-link data-query="tag:${m4.split('=')[0]}"}`
    })
  } catch {
    return ''
  }
}

export function getNewEntryData(text) {
  let entryData = {
    text,
    tags: parseTags(text),
    mood: 0,
    type: 'entry',
    data: null,
  }
  let annotations = []
  entryData.tags.forEach(t => {
    if (t.mood != null && t.mood != undefined) {
      entryData.mood += t.mood
    }
    if (t.type === 'annotation' && t.value) {
      annotations.push([t.id, t.value])
    }
  })
  if (annotations.length > 0) {
    entryData.data = {}
    annotations.forEach((r) => {
      entryData.data[r[0]] = r[1]
    })
  }

  return entryData
}

export function parseFullQuery(query) {
  if (!query) {
    return []
  }
  return query.split(",").map(p => {
    return p.trim()
  }).filter(p => {
    return p.length > 0
  }).map(p => {
    return parseQuery(p)
  })
}

export function parseQuery(query) {
  let tokens = []
  if (!query) {
    return []
  }
  let words = query.split(' ')
  words.forEach((w) => {
    let stripped = w.trim()
    if (!stripped) {
      return
    }
    if (Object.keys(signToMood).indexOf(stripped[0]) > -1) {
      if (stripped.length === 1) {
        tokens.push({sign: stripped[0]})
      } else {
        tokens.push({tag: stripped})
      }
    } else if (stripped.startsWith('d:') || stripped.startsWith('date:') ) {
      tokens.push({date: stripped.split(':')[1]})
    } else if (stripped.startsWith('t:') || stripped.startsWith('tag:') ) {
      tokens.push({tagName: stripped.split(/:(.+)/)[1]})
    } else if (stripped.startsWith('c:') || stripped.startsWith('category:') ) {
      tokens.push({categoryName: stripped.split(/:(.+)/)[1]})
    } else if (stripped.startsWith('$')) {
      tokens.push({alias: stripped.slice(1)})
    } else {
      tokens.push({text: stripped})
    }
  })
  return tokens
}

export function matchString(q, s) {
  if (!q) {
    return false
  }
  let r = new RegExp(q, 'i')
  return s.match(r) || false
}
export function matchTokens(entry, tokens, aliasesById = {}) {
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
     if (token.alias && aliasesById[token.alias]) {
      let match = matchOrTokens(entry, parseFullQuery(aliasesById[token.alias]))
      if (!match) {
        return false
      }
    }
    if (token.text && !entry.text.toLowerCase().includes(token.text.toLowerCase())) {
      return matchString(token.text, entry.text)
    }
    if (token.tag) {
      let matching = entry.tags.filter((t) => {
        return matchString(token.tag.text, t.text)
      })
      if (matching.length === 0) {
        return false
      }
    }
    if (token.tagName) {
      let matching = entry.tags.filter((t) => {
        return matchString(token.tagName, t.id)
      })
      if (matching.length === 0) {
        return false
      }
    }
    if (token.categoryName) {
      return matchString(token.categoryName, entry.category)
    }
    if (token.sign) {
      let matching = entry.tags.filter((t) => {
        return t.sign === token.sign
      })
      if (matching.length === 0) {
        return false
      }
    }
    if (token.date && !entry._id.startsWith(token.date)) {
      return false
    }
  }
  return true
}

export function matchOrTokens(entry, orTokens, aliasesById) {
  for (const tokens of orTokens) {
    if (matchTokens(entry, tokens, aliasesById)) {
      return true
    }
  }
  return false
}
export function getCompleteEntry (e) {
  let fullDate = new Date(e.date)
  let weekNumber = getWeekNumber(fullDate)
  let year = fullDate.getFullYear()
  let entry = {
    text: e.text,
    _id: e._id,
    _rev: e._rev,
    mood: e.mood,
    fullDate: fullDate,
    date: fullDate.toISOString().split('T')[0],
    year: year,
    month: fullDate.getMonth() + 1,
    day: fullDate.getDate(),
    weekday: fullDate.getDay() + 1,
    weeknumber: weekNumber,
    week: `${year}-${weekNumber}`,
    tags: {},
    data: e.data || null,
  }
  e.tags.forEach((t) => {
    entry.tags[t.id] = {
      ...t,
      present: true
    }
  })
  if (entry.data) {
    Object.keys(entry.data).forEach(k => {
      if (entry.data[k]) {
        try {
          entry.data[k] = JSON.parse(entry.data[k])
        } catch (e) {
          // pass
        }
      }
    })
  }
  return entry
}

export function getQueryableEntries (entries, defaultDays) {
  let limit = (new Date((new Date()).getTime() - (defaultDays * 24 * 3600 * 1000))).getTime()
  return entries.filter((e) => {
    return new Date(e.date) >= limit
  }).map((e) => {
    return getCompleteEntry(e)
  })
}

export function getQueryableTags (queryableEntries) {
  let data = {}
  queryableEntries.forEach((e) => {
    Object.keys(e.tags).forEach(tid => {
      let t = data[tid] || {id: tid, entries: 0, mood: 0}
      t.entries += 1
      t.mood += e.mood
      data[tid] = t
    })
  })

  return Object.keys(data).map((t) => {
    return data[t]
  })
}

export function getWeekNumber (d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  var dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
}


export function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function getPrettyTimeFromDate (v) {
  let iso = v.toISOString().split('T')
  let time = iso[1].slice(0, 5).split(':')
  let hours = parseInt(time[0])
  let minutes = parseInt(time[1]) + (hours * 60)
  minutes = minutes - v.getTimezoneOffset()
  let realHours = Math.floor(minutes / 60);
  if (realHours === 24) {
    realHours = 0
  }
  var realMinutes = minutes % 60;
  return `${pad(realHours, 2)}:${pad(realMinutes, 2)}`
}

export const CHARTTYPES = [
  {value: "line", text: "Plot line"},
  {value: "pie", text: "Pie chart"},
  {value: "percentage", text: "Percentage bar"},
  {value: "table", text: "Table"},
  {value: "json", text: "JSON"},
]

export function sortChained(list) {
  let byKey = {}
  list.forEach(e => {
    let previous = e.previousId || 'a'
    let next = e.nextId || 'z'
    let sortKey = `${previous}-${next}-${e._id}`
    byKey[sortKey] = e
  })
  let sortedKeys = Object.keys(byKey)
  sortedKeys.sort()
  return sortedKeys.map(k => {
    return byKey[k]
  })
}
export async function getEntries (store, sortDesc) {
  let options = {
    include_docs: true,
  }
  let result = await store.state.db.allDocs(options)
  let entries = result.rows.map(r => {
    return r.doc
  })
  entries = entries.filter((e) => {
    return e.type == 'entry'
  })
  entries = sortBy(entries, ["date"])
  if (sortDesc) {
    entries.reversed()
  }
  return entries
}

export function filterEntries (entries, queryTokens, aliases) {
  if (queryTokens.length === 0) {
    return entries
  }
  let aliasesById = {}
  aliases.forEach(e => {
    aliasesById[e.name] = e.query
  });
  return entries.filter((e) => {
    return matchOrTokens(e, queryTokens, aliasesById)
  })
}

export async function search ({store, sortDesc, query}) {
  let allEntries = await getEntries(store, sortDesc)
  return filterEntries(
    allEntries,
    parseFullQuery(query),
    store.state.aliases,
  )
}

export function filterTasks (tasks, queryTokens) {
  if (queryTokens.length === 0) {
    return tasks
  }
  return tasks.filter((e) => {
    return matchOrTokens(e, queryTokens)
  })
}

export async function getTasks (store, query) {
  let result = await store.state.db.find({
    selector: {
      type: 'task',
      date: { $gt: 0 }
    }
  })
  let tasks = result.docs
  return filterTasks(
    tasks,
    parseFullQuery(query),
  )
}

export function getSettingValue(s) {
  const excludedAttrs = ["_rev", "_id", "_", "type"]
  for (const key in s) {
    if (Object.hasOwnProperty.call(s, key) && excludedAttrs.indexOf(key) === -1) {
      return s[key]
    }
  }
}

export async function getSettings (store) {
  let result = await store.state.db.find({
    selector: {
      type: 'settings',
    }
  })
  let settings = result.docs.map(r => {
    return {
      _id: r._id,
      _rev: r._rev,
      value: r.value || getSettingValue(r),
    }
  })

  return settings
}

export function downloadFile (window, document, text, mimetype, name) {
  let f = makeFile(window, text, mimetype)
  var link = document.createElement('a')
  link.setAttribute('download', name)
  link.href = f
  document.body.appendChild(link)

  window.requestAnimationFrame(function () {
    var event = new MouseEvent('click')
    link.dispatchEvent(event)
    document.body.removeChild(link)
  })
}

export function makeFile (window, text, mimetype) {
  let data = new Blob([text], {type: mimetype})
  let textFile = window.URL.createObjectURL(data)
  return textFile
}

export const SETTINGS = [
  {name: "webhook", default: () => {return {}}},
  {name: "charts", default: () => {return []}},
  {name: "aliases", default: () => {return []}},
  {name: "boardConfig", default: () => {return {
    lists: [
      {label: "To-do"},
      {label: "Doing"},
    ],
    categories: [
      {label: "Personal"},
      {label: "Work"},
      {label: "House-keeping"},
    ]
  }}},
]

export async function bulkInsertAndUpdate(arr, db) {
  let newEdits = []
  let notNewEdits = []
  await db.compact()
  for (const o of arr) {
    try {
      let e = await db.get(o._id)
      newEdits.push({...o, _rev: e._rev})
    } catch (e) {
      notNewEdits.push({...o})
    }
  }
  let results = [
    ...await db.bulkDocs(notNewEdits, {new_edits: false}),
    ...await db.bulkDocs(newEdits),
  ]
  return results
}
