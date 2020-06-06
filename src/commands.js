
const commandRegex = /^\/(?<command>\w*)\s*(?<body>.*)$/i
export function parseCommand (text) {
  const regex = new RegExp(commandRegex)
  let match = regex.exec(text);
  if (!match) {
    return
  }
  return {
    text: text,
    command: match.groups.command,
    body: match.groups.body,
  }
}
