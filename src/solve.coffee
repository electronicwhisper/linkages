constraintValues = (constraint) ->
  ret = []
  for i in [0...constraint.get("argLength")]
    ret.push(constraint.get("arg"+i))
  return ret

objValues = (o) ->
  ret = []
  for own k, v of o
    ret.push(v)
  return ret

module.exports = (g) ->
  # goes through constraints in g, adjusts values in g to minimize the error functions
  
  solveFor = {} # collect values that are constrained (and not constant)
  g.all("constraint").forEach (constraint) ->
    constraintValues(constraint).forEach (value) ->
      if !value.get("isConstant")
        solveFor[value.id()] = value
  
  solveFor = objValues(solveFor)
  
  if solveFor.length == 0
    return # nothing to solve
  
  # our initial guess (i.e. current values)
  initial = solveFor.map (value) ->
    return value.get("v")
  
  # objective to solve
  objective = (x) ->
    totalError = 0
    g.all("constraint").forEach (constraint) ->
      args = constraintValues(constraint).map (value) ->
        i = solveFor.indexOf(value)
        if i == -1
          return value.get("v") # it's a constant
        else
          return x[i]
      error = constraint.get("f")(args)
      if !constraint.get("isHard")
        error *= .001
      totalError += error
    return totalError
  
  result = numeric.uncmin(objective, initial)
  
  if result.solution
    solveFor.forEach (value, i) ->
      value.set("v", result.solution[i])
  