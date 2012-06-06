threshold = 10

# finds the closest point or line to x, y or returns false
module.exports = (g, x, y) ->
  minDistance = Infinity
  closest = false
  g.all("point").forEach (point) ->
    px = point.get("x").get("v")
    py = point.get("y").get("v")
    d = Math.sqrt((px-x)*(px-x) + (py-y)*(py-y))
    if d < minDistance
      minDistance = d
      closest = point
  
  if minDistance < threshold
    return closest
  else
    return false