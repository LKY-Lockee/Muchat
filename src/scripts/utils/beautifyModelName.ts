export default function beautifyModelName(str: string) {
  return (
    str
      // Remove provider prefix
      .replace(/^[^/]+\//, '')
      // Replace hyphens and underscores with spaces
      .replace(/[-_]/g, ' ')
      // Capitalize the first letter of each word
      .replace(/\b\w+/g, (word) => {
        // Special handling for combinations containing numbers and letters
        // Matches patterns like: "8b", "30b", "a3b", "v1b", etc.
        if (/^[a-z]*\d+[a-z]$/i.test(word)) {
          return word.replace(/[a-z]/gi, (letter) => letter.toUpperCase())
        }
        // Special handling for pure numbers (keep as is)
        if (/^\d+$/.test(word)) {
          return word
        }
        // Capitalize the first letter of each word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      .trim()
  )
}
