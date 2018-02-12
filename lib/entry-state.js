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

  // If there is no published version, it is a draft and can't have pending changes
  if (!publishedEntry) {
    entry.draft = true
    return entry
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
        if (!isArray(innerItem)) {
          setEntryState(entry, innerItem, publishedItem[index])
          return
        }
      })
    } else {
      // If the field is a single reference we just check if it has pending changes
      setEntryState(entry, originalItem, publishedItem)
    }
  })
  // We check if the root element has pending changes
  if (entry && publishedEntry) {
    setEntryState(entry, entry, publishedEntry)
  }

  return entry
}

function isLinkDraft (previewLink, deliveryLink) {
  return previewLink && !deliveryLink
}

function isLinkPendingChanges (previewLink, deliveryLink) {
  if (previewLink && deliveryLink) {
    return !isDateEqual(previewLink.sys.updatedAt, deliveryLink.sys.updatedAt)
  }
  return false
}

function isDateEqual (lhs, rhs) {
  const lhsDate = new Date(lhs)
  const rhsDate = new Date(rhs)
  return lhsDate.setMilliseconds(0) === rhsDate.setMilliseconds(0)
}

function setEntryState (entry, originalItem, publishedItem) {
  if (isLinkDraft(originalItem, publishedItem)) {
    entry.draft = true
  }
  if (isLinkPendingChanges(originalItem, publishedItem)) {
    entry.pendingChanges = true
  }
  return entry
}
