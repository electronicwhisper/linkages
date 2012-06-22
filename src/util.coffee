numeric.distance = (p1, p2) ->
  normalized = numeric.sub(p1, p2)
  return Math.sqrt(numeric.dot(normalized, normalized))

numeric.projectPointToLineSegment = (p, a, b) ->
  # http://www.alecjacobson.com/weblog/?p=1486
  ab = numeric.sub(b, a)
  abSquared = numeric.dot(ab, ab)
  if abSquared == 0
    return a
  else
    ap = numeric.sub(p, a)
    t = numeric.dot(ap, ab) / abSquared
    if t < 0
      return a
    else if t > 1
      return b
    else
      return numeric.add(a, numeric.mul(t, ab))

numeric.distancePointToLineSegment = (p, a, b) ->
  p2 = numeric.projectPointToLineSegment(p, a, b)
  return numeric.distance(p, p2)



module.exports = {}