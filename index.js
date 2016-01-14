const wayfarer = require('wayfarer')
const assert = require('assert')
const sliced = require('sliced')

module.exports = sheetRouter

// Fast, modular client router
// fn(str, any[..]) -> fn(str, any[..])
function sheetRouter (dft, createTree) {
  if (!createTree) {
    createTree = dft
    dft = ''
  }
  assert.equal(typeof dft, 'string', 'dft must be a string')
  assert.equal(typeof createTree, 'function', 'createTree must be a function')

  const router = wayfarer(dft)
  var tree = createTree(function (route, child) {
    assert.equal(typeof route, 'string', 'route must be a string')
    assert.ok(child, 'child exists')
    route = route.replace(/^\//, '')
    return [ route, child ]
  })

  tree = Array.isArray(tree) ? tree : [ tree ]

  // register tree in router
  ;(function walk (tree, route) {
    if (Array.isArray(tree[0])) {
      // handle special case of tree entry which is a flat array
      tree.forEach(function (node) {
        walk(node, route)
      })
    } else if (Array.isArray(tree[1])) {
      // traverse and append route
      walk(tree[1], route.concat(tree[0]))
    } else {
      // register path in router
      const nwRoute = tree[0]
        ? route.concat(tree[0]).join('/')
        : route.length ? route.join('/') : tree[0]
      router.on(nwRoute, tree[1])
    }
  })(tree, [])

  // match a route on the router
  return function match (route) {
    assert.equal(typeof route, 'string', 'route must be a string')
    return router.apply(null, sliced(arguments))
  }
}
