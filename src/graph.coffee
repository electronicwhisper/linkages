indexedTable = require("./indexedTable")

idCount = 0
makeId = () ->
  return "" + idCount++



nodes = indexedTable("node", "type")
links = indexedTable("node", "target")


isNode = (potentialNode) ->
  potentialNode?.id?()?



makeNode = (type, initialSet) ->
  node = {}
  
  id = makeId()
  attributes = {}
  
  node.id = node.toString = () -> id
  node.type = () -> type
  node.get = (key) -> attributes[key]
  node.set = (key, value) ->
    # sugar, you can pass in an object of things to set
    if typeof key == "object"
      for k, v of key
        node.set(k, v)
    else
      # remove old links
      links.remove({node: node, key: key})
      
      attributes[key] = value
      
      # add new link (if new value is a node)
      if isNode(value)
        links.add({node: node, target: value, key: key, type: node.type()})
    
    return node # for chaining
  
  node.attributes = () -> attributes # TODO: this should be a shallow copy
  
  
  node.backLinks = (type, key) ->
    query = {target: node}
    query.type = type if type?
    query.key = key if key?
    links.find(query).map (link) -> link.node
  
  node.remove = () ->
    # remove me from the main nodes table
    nodes.remove({node: node})
    
    # remove all links from me
    links.remove({node: node})
    
    # remove anything that points to me
    node.backLinks().forEach (n) ->
      n.remove()
  
  node.merge = (mergedNodes...) ->
    # recursively merge all of the mergedNodes attributes into my attributes
    mergedNodes.forEach (n) ->
      for own key, value of n.attributes()
        if isNode(value)
          mergeNodes(node.get(key), value)
    
    # make all nodes which point at mergedNodes instead point at me
    mergedNodes.forEach (n) ->
      links.find({target: n}).forEach (link) ->
        link.node.set(link.key, node)
    
    # remove all the mergedNodes
    mergedNodes.forEach (n) ->
      n.remove()
  
  if initialSet
    node.set(initialSet)
  
  # add it to the table of all nodes
  nodes.add({node: node, type: node.type()})
  
  return node


all = (type) ->
  query = {}
  query.type = type if type?
  
  return nodes.find(query).map (res) -> res.node


module.exports = {
  node: makeNode
  isNode: isNode
  all: all
}