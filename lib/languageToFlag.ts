
export const toFlagEmoji = (lang) => {
  const OFFSET = 127397

  if (!/^[a-z]{2}$/i.test(lang)) {
    throw new Error('Invalid country code [' + lang + ']')
  }

  lang = lang.toUpperCase()
  let flagEmoji = ''

  for (let i = 0; i < 2; i++) {
    const letter = lang.charAt(i)
    const ord = letter.charCodeAt(0)

    if (isNaN(ord)) {
      throw new Error('Unable to process character ' + letter + ' in [' + lang + ']')
    }

    const unicode = ord + OFFSET
    flagEmoji += String.fromCodePoint(unicode)
  }

  return flagEmoji
}
