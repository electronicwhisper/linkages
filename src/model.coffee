cs = require("./constraintSolver")
constraintTypes = require("./constraintTypes")
util = require("./util")

all = {
  point: []
  line: []
  constraint: []
}

make = (type, o) ->
  all[type].push(o)
  o.type = type
  o.remove = () ->
    i = all[type].indexOf(o)
    if i != -1
      all[type].splice(i, 1)
  return o

makePoint = (location=[0,0]) ->
  point = make "point", cs.cell(location)

makeLine = (p1, p2) ->
  line = make "line", {
    p1: p1
    p2: p2
    
    # helpers
    length: () ->
      numeric.distance(line.p1(), line.p2())
    slope: () ->
      v = numeric.sub(line.p2(), line.p1())
      norm = numeric.norm2(v)
      return numeric.div(v, norm)
  }

makeConstraint = (props) ->
  constraint = make "constraint", () ->
    constraintTypes[constraint.constraintType](constraint)
  for own k, v of props
    constraint[k] = v
  return constraint



module.exports = {
  point: makePoint
  line: makeLine
  constraint: makeConstraint
  all: all
}