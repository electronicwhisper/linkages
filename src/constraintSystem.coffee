setAdd = (set, x) ->
  if set.indexOf(x) == -1
    set.push(x)

setRemove = (set, x) ->
  i = set.indexOf(x)
  if i != -1
    set.splice(i, 1)



constraintSystem = () ->
  constraints = []
  
  
  makeCell = (initialValue=0, isConstant=false) ->
    o = {}
    o.value = initialValue
    o.isConstant = isConstant
    o.constraints = []
    return o
  
  
  makeConstraint = (errorFunction, cells...) ->
    o = {}
    o.errorFunction = errorFunction
    o.cells = cells
    o.isHard = true
    o.remove = () ->
      cells.forEach (cell) ->
        setRemove(cell.constraints, o)
    
    setAdd(constraints, o)
    cells.forEach (cell) ->
      setAdd(cell.constraints, o)
    
    return o
  
  # sugar to make a soft constraint
  minimize = (errorFunction, cells...) ->
    c = constraint(errorFunction, cells...)
    c.isHard = false
    return c
  
  
  solve = () ->
    # collect all cells that are constrained (i.e. part of a constraint and not constant)
    solveFor = []
    constraints.forEach (constraint) ->
      constraint.cells.forEach (cell) ->
        if !cell.isConstant
          setAdd(solveFor, cell)
    
    objective = (x) ->
      totalError = 0
      constraints.forEach (constraint) ->
        args = constraint.cells.map (cell) ->
          i = solveFor.indexOf(cell)
          if i == -1
            return cell.value # it's a constant
          else
            return x[i]
        error = constraint.errorFunction(args...)
        if constraint.isHard
          error *= 100
        totalError += error
      return totalError
    
    initial = solveFor.map (cell) ->
      return cell.value
    
    result = numeric.uncmin(objective, initial)
    # console.log result
    
    if result.solution
      solveFor.forEach (cell, i) ->
        cell.value = result.solution[i]
  
  return {
    cell: makeCell
    constraint: makeConstraint
    minimize: minimize
    solve: solve
  }

module.exports = constraintSystem