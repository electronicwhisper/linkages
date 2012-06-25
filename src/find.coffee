util = require("./util")
model = require("./model")

pointThreshold = 10
lineThreshold = 4

# finds the closest point or line to x, y or returns false
module.exports = (pos) ->
  minDistance = 0
  closest = false
  
  model.all.point.forEach (point) ->
    d = numeric.distance(point(), pos) - pointThreshold
    if d < minDistance
      minDistance = d
      closest = point
  
  model.all.line.forEach (line) ->
    d = numeric.distancePointToLineSegment(pos, line.p1(), line.p2()) - lineThreshold
    if d < minDistance
      minDistance = d
      closest = line
  
  return closest