module.exports = {
  "equalLength": (constraint) ->
    length = constraint.lines[0].length()
    e = 0
    constraint.lines.forEach (line) ->
      e += numeric.sqr(line.length() - length)
    return e
  "fixLength": (constraint) ->
    return numeric.sqr(constraint.line.length() - constraint.distance)
  "parallel": (constraint) ->
    slope = constraint.lines[0].slope()
    e = 0
    constraint.lines.forEach (line) ->
      e += numeric.sqr(numeric.area(slope, line.slope()))
    return e
  "fixSlope": (constraint) ->
    return numeric.sqr(numeric.area(constraint.slope, constraint.line.slope()))
  "dragMouse": (constraint) ->
    # return numeric.sqr(numeric.distance([20,20], constraint.point()))
    return numeric.sqr(numeric.distance(numeric.add(constraint.mouse(), constraint.offset), constraint.point()))
}