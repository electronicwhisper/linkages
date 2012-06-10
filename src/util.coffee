distance = (p1x, p1y, p2x, p2y) ->
  dx = p1x - p2x
  dy = p1y - p2y
  return Math.sqrt(dx *dx + dy * dy)

distancePointLine = (px, py, l1x, l1y, l2x, l2y) ->
  # http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html (14)
  dx = l2x - l1x
  dy = l2y - l1y
  return Math.abs(dx*(l1y-py) - dy*(l1x-px))/Math.sqrt(dx*dx + dy*dy)


module.exports = {
  distance: distance
  distancePointLine: distancePointLine
}