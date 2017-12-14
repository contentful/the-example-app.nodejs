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
    return
  }
  // We group fields of type link (i.e. Only objects/array) from the same entry in preview and delivery
  const entriesToCompare = Object.keys(entry.fields).map((key) => {
    const field = entry.fields[key]
    if (isObject(field)) {
      return [entry.fields[key], publishedEntry.fields[key]]
    }
  }).filter(Boolean)

  entriesToCompare.forEach((item) => {
    const originalItem = item[0]
    const publishedItem = item[1]
    // If the field is an array of reference we need to check its item if they have pending changes
    if (isArray(originalItem)) {
      originalItem.forEach((innerItem, index) => {
        if (!isArray(innerItem) && isLinkDraft(innerItem, publishedItem[index])) {
          entry.pendingChanges = true
          return
        }
      })
      // If the field is a single reference we just check if it has pending changes
    } else if (isLinkDraft(item[0], item[1])) {
      entry.pendingChanges = true
      return
    }
  })
  // We check if the root element has pending changes
  if (entry && publishedEntry && (!isDateEqual(entry.sys.updatedAt !== publishedEntry.sys.updatedAt))) {
    entry.pendingChanges = true
  }

  return entry
}

function isLinkDraft (previewLink, deliveryLink) {
  return isObject(previewLink) && (!previewLink.fields || !isDateEqual(previewLink.sys.updatedAt !== previewLink.sys.updatedAt))
}

function isDateEqual (lhs, rhs) {
  const lhsDate = new Date(lhs)
  const rhsDate = new Date(rhs)
  return lhsDate.setMilliseconds(0) === rhsDate.setMilliseconds(0)
}

