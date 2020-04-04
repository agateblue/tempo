
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
    return ` <router-link :to="{name: 'Home', query: {tag: '${m2}'}}">${m2}</router-link>`
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
