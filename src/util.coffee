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

numeric.sqr = (x) -> x*x

# finds the area of the outer product of v1 and v2 (i.e. parallelogram formed by them)
# note: can be negative
numeric.area = (v1, v2) ->
  # for now assumes both 2-dimensional
  v1[0]*v2[1] - v1[1]*v2[0]

module.exports = {}