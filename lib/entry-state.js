const { getEntry } = require('./../services/contentful')
const { isObject, isArray } = require('lodash')

async function getPublishedEntry (entry) {
  try {
    return await getEntry(entry.sys.id, entry.sys.contentType.sys.id)
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

  const entriesToCompare = Object.keys(entry.fields).map((key) => {
    const field = entry.fields[key]
    if (isObject(field)) {
      return [entry.fields[key], publishedEntry.fields[key]]
    }
  }).filter(Boolean)
  entriesToCompare.forEach((item) => {
    const originalItem = item[0]
    const publishedItem = item[1]
    if (isArray(originalItem)) {
      originalItem.forEach((innerItem, index) => {
        if (!isArray(innerItem) && isObject(innerItem) && (!innerItem.fields || originalItem[index].sys.updatedAt !== publishedItem[index].sys.updatedAt)) {
          entry.pendingChanges = true
          return
        }
      })
    } else if (isObject(item[0]) && (!item[0].fields || item[0].sys.updatedAt !== item[1].sys.updatedAt)) {
      entry.pendingChanges = true
      return
    }
  })

  if (entry && publishedEntry && (entry.sys.updatedAt !== publishedEntry.sys.updatedAt)) {
    entry.pendingChanges = true
  }

  return entry
}
