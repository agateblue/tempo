import yaml from 'yamljs'

const signToMood = {
  '+': 1,
  '-': -1,
  '~': 0,
  '?': null,
  '#': null,
  '!': null,
}
const signToType = {
  '+': 'feeling',
  '-': 'feeling',
  '~': 'feeling',
  '?': 'feeling',
  '#': 'tag',
}
const tagRegex = /(^|\s)((?!---)(#|\+{1,3}|-{1,3}|~|\?|!)([A-zÀ-ÿ\d-]+))/gi
export function parseTags (text) {
  const tags = []
  const regex = new RegExp(tagRegex)
  let match = regex.exec(text);
  while (match != null) {
    let tag = {
      text: match[2],
      sign: match[3][0],
      id: match[4],
    }
    tag.type = signToType[tag.sign]
    tag.mood = signToMood[tag.sign]
    if (tag.mood) {
      tag.mood = tag.mood * match[3].length
    }
    tags.push(tag)
    match = regex.exec(text)
  }
  return tags
}

export function insertTagMarkup (text) {
  try {
    return text.replace(tagRegex, (match, m1, m2) => {  // eslint-disable-line no-unused-vars
      return `[${m2}](/?q=${m2}){.internal-link}`
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
    event: null,
    data: null,
  }
  let frontMatter = getFrontMatter(text)

  if (frontMatter) {
    let eventData = parseFrontMatter(frontMatter)
    if (eventData && typeof eventData === "object" && eventData.event) {
      entryData.event = String(eventData.event)
      entryData.data = eventData
      delete entryData.data.event
    }
  }
  entryData.tags.forEach(t => {
    if (t.mood != null && t.mood != undefined) {
      entryData.mood += t.mood
    }
  })
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
    } else if (stripped[0] == '@') {
      tokens.push({date: stripped.slice(1)})
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

export function getFrontMatter (entry) {
  let parts = entry.split('\n---\n')
  if (parts.length > 1) {
    return parts[0]
  }
  return null
}

export function parseFrontMatter(raw) {
  try {
    return yaml.parse(raw)
  } catch (e) {
    console.log('Invalid front matter', raw)
    return null
  }

}
export function quoteFrontMatter(text) {
  if (getFrontMatter(text)) {
    text = '```\n' + text.replace('\n---\n', '\n```\n')
  }
  return text
}

export function getCompleteEntry (e) {
  let fullDate = new Date(e.date)
  let weekNumber = getWeekNumber(fullDate)
  let year = fullDate.getFullYear()
  let entry = {
    text: e.text,
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
    event: e.event || null,
    data: e.data || null,
  }
  e.tags.forEach((t) => {
    entry.tags[t.id] = {
      ...t,
      present: true
    }
  })
  return entry
}


export function getWeekNumber (d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  var dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1))
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
}
