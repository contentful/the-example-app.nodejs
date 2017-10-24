const { getEntry } = require('./../services/contentful')

async function getPublishedEntry (entry) {
  try {
    return await getEntry(entry.sys.id)
  } catch (err) {
    return null
  }
}

module.exports = async function attachEntryState (entry) {
  const publishedEntry = await getPublishedEntry(entry)
  entry.draft = false
  entry.pendingChanges = false

  if (!publishedEntry) {
    entry.draft = true
  }

  if (entry && publishedEntry && (entry.sys.updatedAt !== publishedEntry.sys.updatedAt)) {
    entry.pendingChanges = true
  }

  return entry
}
