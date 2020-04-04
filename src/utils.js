
const signToEffect = {
  '+': 1,
  '-': -1,
  '~': 0,
  '?': null,
  '#': null,
}
const signToType = {
  '+': 'feeling',
  '-': 'feeling',
  '~': 'feeling',
  '?': 'feeling',
  '#': 'tag',
}
const tagRegex = /(^|\s)((#|\+|-|~|\?)([a-z\d-]+))/gi
export function parseTags (text) {
  const tags = []
  const regex = new RegExp(tagRegex)
  let match = regex.exec(text);
  while (match != null) {
    let tag = {
      text: match[2],
      sign: match[3],
      id: match[4],
    }
    tag.type = signToType[tag.sign]
    tag.effect = signToEffect[tag.sign]
    tags.push(tag)
    match = regex.exec(text)
  }
  return tags
}

export function insertTagMarkup (text) {
  return text.replace(tagRegex, (match, m1, m2) => {  // eslint-disable-line no-unused-vars
    return ` <router-link :to="{name: 'Home', query: {q: '${m2}'}}">${m2}</router-link>`
  })
}

export function getNewEntryData(text) {
  let entryData = {
    text,
    tags: parseTags(text),
    effect: 0,
    type: 'entry',
  }
  entryData.tags.forEach(t => {
    if (t.effect != null && t.effect != undefined) {
      entryData.effect += t.effect
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
    if (Object.keys(signToEffect).indexOf(stripped[0]) > -1) {
      if (stripped.length === 1) {
        tokens.push({sign: stripped[0]})
      } else {
        tokens.push({tag: stripped})
      }
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
  }
  return true
}
