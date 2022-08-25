/**
 * Way data is stored for this database
 * For a Node.js/Node Webkit database it's the file system
 * For a browser-side database it's localforage, which uses the best backend available (IndexedDB then WebSQL then localStorage)
 *
 * This version is the browser version
 */

var localforage = require('localforage')

// Configure localforage to display NeDB name for now. Would be a good idea to let user use his own app name
localforage.config({
  name: 'NeDB',
  storeName: 'nedbdata',
})

let store = localforage

function createInstance({name, storeName}) {
  store = localforage.createInstance({
    name: name || 'NeDB',
    storeName: storeName || 'nedbdata',
  })
}

function exists(filename, callback) {
  store.getItem(filename, function (err, value) {
    if (value !== null) {
      // Even if value is undefined, localforage returns null
      return callback(true)
    } else {
      return callback(false)
    }
  })
}

function rename(filename, newFilename, callback) {
  store.getItem(filename, function (err, value) {
    if (value === null) {
      store.removeItem(newFilename, function () {
        return callback()
      })
    } else {
      store.setItem(newFilename, value, function () {
        store.removeItem(filename, function () {
          return callback()
        })
      })
    }
  })
}

function writeFile(filename, contents, options, callback) {
  // Options do not matter in browser setup
  if (typeof options === 'function') {
    callback = options
  }
  store.setItem(filename, contents, function () {
    return callback()
  })
}

function appendFile(filename, toAppend, options, callback) {
  // Options do not matter in browser setup
  if (typeof options === 'function') {
    callback = options
  }

  store.getItem(filename, function (err, contents) {
    contents = contents || ''
    contents += toAppend
    store.setItem(filename, contents, function () {
      return callback()
    })
  })
}

function readFile(filename, options, callback) {
  // Options do not matter in browser setup
  if (typeof options === 'function') {
    callback = options
  }
  store.getItem(filename, function (err, contents) {
    return callback(null, contents || '')
  })
}

function unlink(filename, callback) {
  store.removeItem(filename, function () {
    return callback()
  })
}

// Nothing to do, no directories will be used on the browser
function mkdirp(dir, callback) {
  return callback()
}

// Nothing to do, no data corruption possible in the brower
function ensureDatafileIntegrity(filename, callback) {
  return callback(null)
}

// Interface
module.exports.exists = exists
module.exports.rename = rename
module.exports.writeFile = writeFile
module.exports.crashSafeWriteFile = writeFile // No need for a crash safe function in the browser
module.exports.appendFile = appendFile
module.exports.readFile = readFile
module.exports.unlink = unlink
module.exports.mkdirp = mkdirp
module.exports.ensureDatafileIntegrity = ensureDatafileIntegrity
module.exports.createInstance = createInstance
