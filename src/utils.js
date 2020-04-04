
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
export function parseTags (text) {
  const tags = []
  const tagRegex = /(^|\s)((#|\+|-|~|\?)([a-z\d-]+))/gi
  let match = tagRegex.exec(text);
  while (match != null) {
    let tag = {
      text: match[2],
      sign: match[3],
      id: match[4],
    }
    tag.type = signToType[tag.sign]
    tag.effect = signToEffect[tag.sign]
    tags.push(tag)
    match = tagRegex.exec(text)
  }
  return tags
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
