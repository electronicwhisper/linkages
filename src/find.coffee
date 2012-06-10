util = require("./util")

pointThreshold = 10
lineThreshold = 4

# finds the closest point or line to x, y or returns false
module.exports = (g, x, y) ->
  minDistance = 0
  closest = false
  
  g.all("point").forEach (point) ->
    px = point.get("x").get("v")
    py = point.get("y").get("v")
    d = util.distance(px, py, x, y) - pointThreshold
    if d < minDistance
      minDistance = d
      closest = point
  
  g.all("line").forEach (line) ->
    l1x = line.get("p1").get("x").get("v")
    l1y = line.get("p1").get("y").get("v")
    l2x = line.get("p2").get("x").get("v")
    l2y = line.get("p2").get("y").get("v")
    d = util.distancePointLine(x, y, l1x, l1y, l2x, l2y) - lineThreshold
    if d < minDistance
      minDistance = d
      closest = line
  
  return closest