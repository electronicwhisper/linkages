module.exports = (cs) ->
  
  points = []
  lines = []
  
  makePoint = (x, y) ->
    o = {}
    o.p = [cs.cell(x), cs.cell(y)]
    o.fixed = false
    o.setFixed = (fixed) ->
      o.fixed = fixed
      o.p.forEach (cell) ->
        cell.isConstant = fixed
    points.push(o)
    return o
  
  makeLine = (p1, p2) ->
    o = {}
    o.p1 = p1
    o.p2 = p2
    o.fixed = false
    constraint = undefined
    distance = () ->
      x1 = o.p1.p[0].value
      y1 = o.p1.p[1].value
      x2 = o.p2.p[0].value
      y2 = o.p2.p[1].value
      return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
    o.setFixed = (fixed) ->
      o.fixed = fixed
      if fixed
        fixedDistance = distance()
        error = (x1, y1, x2, y2) ->
          d = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
          e = fixedDistance - d
          return e*e
        constraint = cs.constraint(error, o.p1.p[0], o.p1.p[1], o.p2.p[0], o.p2.p[1])
      else
        constraint.remove()
    
    lines.push(o)
    return o
  
  mergePoints = (p1, p2) ->
    # merge p
    # merge all lines
  
  return {
    makePoint: makePoint
    makeLine: makeLine
    points: points
    lines: lines
  }