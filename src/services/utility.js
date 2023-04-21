const camelize = require('camelcase-keys')
const snakeize = require('snakecase-keys')

exports.camelcaseKeys = (obj, options = {}) => camelize(obj, { deep: true, ...options })

exports.snakecaseKeys = (obj, options = {}) => snakeize(obj, { deep: true, ...options })

exports.arrayToFlatTree = (items, id, attr) => items
  .filter((item) => Number(item[attr]) === Number(id))
  .reduce((acc, curr) => {
    let childs = []

    if (Number(curr[attr]) !== Number(curr.id)) {
      childs = exports.arrayToFlatTree(items, curr.id, attr)
    }

    return [...acc, curr, ...childs]
  }, [])

exports.arrayToHierarchy = (id, items) => {
  const node = items.find((o) => Number(id) === Number(o.id))

  if (!node) return []
  if (!node.folderId) return [node]

  return [...exports.arrayToHierarchy(node.folderId, items), node]
}

exports.excludeKeys = (obj, omit = []) => Object.fromEntries(
  Object.entries(obj).filter(([key]) => !omit.includes(key)),
)

exports.onlyKeys = (obj, keep = []) => Object.fromEntries(
  Object.entries(obj).filter(([key]) => keep.includes(key)),
)

exports.removeUndefinedKeys = (obj) => Object.keys(obj).reduce((acc, key) => (
  obj[key] === undefined ? { ...acc } : { ...acc, [key]: obj[key] }
), {})
