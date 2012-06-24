idCount = 0
makeId = () ->
  return "" + idCount++

mergeInto = (o, o2) ->
  for own k, v of o2
    o[k] = v

objValues = (o) ->
  ret = []
  for own k, v of o
    ret.push(v)
  return ret




# used to keep track of cells that get accessed
accessed = false

makeCell = (value=0) ->
  id = makeId()
  cell = (newValue) ->
    if newValue? # set the value
      value = newValue
    else # get the value
      if accessed
        accessed[id] = cell
      return value


collect = (f) ->
  # return a hash containing the cells that get accessed by f
  accessed = {}
  f()
  cells = accessed
  accessed = false
  return cells


solve = (constraints) ->
  solveFor = {} # collect cells that are constrained
  
  constraints.forEach (constraint) ->
    mergeInto(solveFor, collect(constraint))
  
  # remove any cells that are constant
  for own id, cell of solveFor
    if cell.constant
      delete solveFor[id]
  
  cellArray = objValues(solveFor)
  
  if cellArray.length == 0
    return true # nothing to solve
  
  # our initial guess (i.e. current values)
  initial = []
  cellArray.forEach (cell) ->
    v = cell()
    if v.length
      initial.push(v...)
    else
      initial.push(v)
  
  setValues = (values) ->
    i = 0
    cellArray.forEach (cell) ->
      v = cell()
      if v.length
        cell(values[i...i+v.length])
        i += v.length
      else
        cell(values[i])
        i += 1
  
  # objective to solve
  objective = (x) ->
    # set the values
    setValues(x)
    
    # add up the total error
    totalError = 0
    constraints.forEach (constraint) ->
      error = constraint()
      if constraint.soft
        error *= .001
      totalError += error
    
    return totalError
  
  result = numeric.uncmin(objective, initial)
  
  if result.solution
    setValues(result.solution)
    return true
  else
    # reset values
    initial.forEach (originalValue, i) ->
      solveFor[i](originalValue)
    return false



module.exports = {
  cell: makeCell
  solve: solve
}