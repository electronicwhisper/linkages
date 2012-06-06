autovivify = (hash, keys...) ->
  ret = hash
  keys.forEach (key) ->
    if ret[key]?
      ret = ret[key]
    else
      ret = ret[key] = {}
  return ret

module.exports = (indexKeys...) ->
  idCount = 0
  makeId = () ->
    return "" + idCount++
  
  table = {}
  index = {}
  
  add = (item) ->
    id = makeId()
    table[id] = item
    
    # add to index
    indexKeys.forEach (indexKey) ->
      autovivify(index, indexKey, item[indexKey])[id] = item
  
  match = (needle, item) ->
    ret = true
    for own key, value of needle
      if item[key] != value
        ret = false
    return ret
  
  find = (needle={}, returnIds=false) ->
    search = table
    
    # find an index to narrow down search TODO: find the best index
    for own key, value of needle
      if index[key]
        search = index[key][value]
    
    ret = []
    for own id, item of search
      # check that it matches the needle
      if match(needle, item)
        if returnIds
          ret.push(id)
        else
          ret.push(item)
    
    return ret
  
  remove = (needle={}) ->
    ids = find(needle, true)
    
    ids.forEach (id) ->
      # delete from indexes
      indexKeys.forEach (indexKey) ->
        delete autovivify(index, indexKey, table[id][indexKey])[id]
      
      # delete from table
      delete table[id]
  
  return {
    add: add
    find: (needle) -> find(needle)
    remove: remove
  }