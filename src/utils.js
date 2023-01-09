import Vue from 'vue'
import sub from 'date-fns/sub'

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
  '!': 'tag',
  '@': 'annotation',
}
const tagRegex = /(^|\s)((#|\+{1,5}|-{1,5}|~|\?|!|@)([:A-zÀ-ÿ\d][:A-zÀ-ÿ\d-]*(=(true|false|[:A-zÀ-ÿ\d-]+|".*")?(-?\d*(\.(\d+))?)?)?))/gi

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

export function getNewEntryData(text, additionalValues = {}) {
  let entryData = {
    text,
    tags: parseTags(text),
    mood: 0,
    type: 'entry',
    data: null,
    favorite: false,
    thread: additionalValues.thread || null,
    replies: additionalValues.replies || [],
    form: null,
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
    if (signToType[stripped[0]]) {
      if (stripped.length === 1) {
        tokens.push({sign: stripped[0]})
      } else {
        let tag = parseTags(stripped)[0]
        tokens.push({tagName: tag.id, sign: tag.sign === '#' ? null : tag.sign})
      }
    } else if (stripped.startsWith('d:') || stripped.startsWith('date:') ) {
      tokens.push({date: stripped.split(':')[1]})
    } else if (stripped.startsWith('is:fav')) {
      tokens.push({favorite: true})
    } else if (stripped.startsWith('is:thread')) {
      tokens.push({thread: true})
    } else if (stripped.startsWith('is:reply')) {
      tokens.push({reply: true})
    } else if (stripped.startsWith('is:form')) {
      tokens.push({form: true})
    } else if (stripped.startsWith('form:')) {
      let formId = stripped.split(':').slice(1).join(':')
      tokens.push({formId})
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

export function objectValuesAndKeys (object) {
  if (!object) {
    return []
  }
  let values = []
  for (const key in object) {
    if (Object.hasOwnProperty.call(object, key)) {
      values.push(key)
      values.push(object[key])
    }
  }
  return values
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
    if (token.tag) {
      let matching = entry.tags.filter((t) => {
        return matchString(token.tag.text, t.text)
      })
      if (matching.length === 0) {
        return false
      }
    }
    else if (token.text) {
      let additionalContent = objectValuesAndKeys(entry.data)
      if (entry.form) {
        additionalContent.push(entry.form)
      }
      let haystack = `${entry.text} ${additionalContent.join(' ')}`
      if (!haystack.toLowerCase().includes(token.text.toLowerCase())) {
        return matchString(token.text, haystack)
      }
    }
    if (token.favorite && !entry.favorite) {
      return false
    }
    if (token.form && !entry.form) {
      return false
    }
    if (token.formId && entry.form != token.formId) {
      return false
    }
    if (token.thread && (entry.replies || []).length === 0) {
      return false
    }
    if (token.reply && !entry.thread) {
      return false
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
    favorite: e.favorite || false,
    thread: e.thread || null,
    replies: e.replies || [],
    form: e.form,
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

export function getQueryableEntries (entries, start, end) {
  start = new Date(start).getTime()
  end = new Date(end).getTime() + 3600 * 24 * 1000
  return entries.filter((e) => {
    let eDate = new Date(e.date).getTime()
    return eDate >= start && eDate < end
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
  return v.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hourCycle: 'h23' })
}

export const DISPLAYTYPES = [
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
  console.time('getEntries')
  let options = {
    include_docs: true,
    descending: sortDesc
  }
  let result = await store.state.db.allDocs(options)
  let entries = result.rows.flatMap(r => r.doc.type === 'entry' ? [r.doc] : [])
  console.timeEnd('getEntries')
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
    store.state.settings.aliases,
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

export async function getBlueprints (store) {
  let result = await store.state.db.find({
    selector: {
      type: 'blueprint',
    }
  })
  return result.docs
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
  {name: "telemetry", default: () => {return true}},
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
  {name: "blueprints", default: () => {
    return [
      "builtin:mood",
      "builtin:tags",
    ]
  }},
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


export function getShortEntryId (id) {
  return id.slice(0, 19)
}


export function getCleanUrlForTracking (location, path) {
  // remove querystring since it may contain sensitive data
  path = path.split('?')[0]
  return `${location.protocol}//${location.hostname}${path}`
}

export function trackEvent(store, event, props = {}, eventData = {}) {
  console.debug("[telemetry] tracking", event)

  if (!process.env.VUE_APP_PLAUSIBLE_HOST) {
    console.debug("[telemetry] skipping, disabled at build time")
    return
  }
  if (!store.getters["settings"].telemetry) {
    console.debug("[telemetry] skipping, disabled by user")
    return
  }
  try {
    Vue.$plausible.trackEvent(event, {props, callback () {
      console.debug("[telemetry] sent")
    }}, {
      url: getCleanUrlForTracking(window.location, window.location.href.split("#")[1]),
      referrer: null,
      ...eventData,
    })
  } catch (e) {
    console.warn("Could not track event", e)
  }
}

export function getDates (start, end) {
  end = end ? new Date(end) : new Date
  start = start ? new Date(start) : sub(end, {months: 2})
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  }
}