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
const tagRegex = /(^|\s)((?!---)(#|\+{1,3}|-{1,3}|~|\?|!|@)([:A-zÀ-ÿ\d-]+(=(true|false|[:A-zÀ-ÿ\d-]+|".*")?(-?\d*(\.(\d+))?)?)?))/gi

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
      if (!tag.id.includes('=')) {
        include = false
      }
      let parts = tag.id.replace(/"/g, "").split('=')
      tag.id = parts[0]
      tag.value = parts[1]
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
    }  else if (stripped.startsWith('d:') || stripped.startsWith('date:') ) {
      tokens.push({date: stripped.split(':')[1]})
    } else if (stripped.startsWith('t:') || stripped.startsWith('tag:') ) {
      tokens.push({tagName: stripped.split(/:(.+)/)[1]})
    } else {
      tokens.push({text: stripped})
    }
  })
  return tokens
}

export function matchTokens(entry, tokens) {
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.text && !entry.text.toLowerCase().includes(token.text.toLowerCase())) {
      return false
    }
    if (token.tag) {
      let matching = entry.tags.filter((t) => {
        return t.text.toLowerCase() === token.tag.toLowerCase()
      })
      if (matching.length === 0) {
        return false
      }
    }
    if (token.tagName) {
      let matching = entry.tags.filter((t) => {
        return t.id.toLowerCase() === token.tagName.toLowerCase()
      })
      if (matching.length === 0) {
        return false
      }
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