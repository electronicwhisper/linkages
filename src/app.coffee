module.exports = () ->
  
  g = require("./graph")
  render = require("./render")
  find = require("./find")
  solve = require("./solve")
  util = require("./util")
  
  makeValue = (v) ->
    g.node("value", {v: v, isConstant: false})
  
  makeConstraint = (f, values) ->
    constraint = g.node("constraint", {f: f, isHard: true, argLength: values.length})
    values.forEach (value, i) ->
      constraint.set("arg"+i, value)
    return constraint
  
  makePoint = (x, y) ->
    g.node("point", {x: makeValue(x), y: makeValue(y), constrained: false})
  
  makeLine = (p1, p2) ->
    g.node("line", {p1: p1, p2: p2, constrained: false})
  
  
  
  
  
  do ->
    canvas = document.getElementById("c")
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    
    n = 6
    ps = [0...n].map () -> makePoint(Math.random() * width, Math.random() * height)
    ps.forEach (p1, i) ->
      ps[i+1...n].forEach (p2) ->
        makeLine(p1, p2)
  
  
  

  
  
  constraints = {}
  
  constraints.setDistance = (p1, p2, distance) ->
    makeConstraint((([p1x, p1y, p2x, p2y]) ->
      e = numeric.distance([p1x, p1y], [p2x, p2y]) - distance
      return e * e
    ), [p1.get("x"), p1.get("y"), p2.get("x"), p2.get("y")])
  
  constraints.moveWithMouse = (p) ->
    constraints.setDistance(p, mousePos, 0).set("isHard", false)
  
  constraints.equalLength = (l1, l2) ->
    # initialLength = numeric.distance([l1.get("p1").get("x"), l1.get("p1").get("y")], [l1.get("p2").get("x"), l1.get("p2").get("y")])
    # length = makeValue(initialLength)
    makeConstraint((([p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y]) ->
      d1 = numeric.distance([p1x, p1y], [p2x, p2y])
      d2 = numeric.distance([p3x, p3y], [p4x, p4y])
      e = d1 - d2
      return e * e
    ), [l1.get("p1").get("x"), l1.get("p1").get("y"), l1.get("p2").get("x"), l1.get("p2").get("y"), l2.get("p1").get("x"), l2.get("p1").get("y"), l2.get("p2").get("x"), l2.get("p2").get("y")])
  
  
  # constraints.equalLength(lines) ->
  #   initialLength = numeric.distance([lines[0].get("p1").get("x"), lines[0].get("p1").get("y")], [lines[0].get("p2").get("x"), lines[0].get("p2").get("y")])
  #   makeValue(initialLength)
  #   makeConstraint(((l, ps...) ->
  #     
  #   ), )
  
  
  
  
  
  
  
  mouseOn = false # keep track of what point or line the mouse is on
  mousePos = g.node("pseudoPoint", {x: makeValue(0).set("isConstant", true), y: makeValue(0).set("isConstant", true)})
  
  selected = []
  
  
  redraw = () ->
    render(g, mouseOn, selected)
  
  redraw()
  
  
  dragging = false
  potentialClick = false
  
  mouseMove = (x, y) ->
    mouseOn = find(g, x, y)
    redraw()
  
  dragMove = (x, y) ->
    solve(g)
    redraw()
  
  mouseDown = (x, y) ->
    if g.isNode(mouseOn, "point")
      point = mouseOn
      
      #hack
      point.get("x").set("isConstant", false)
      point.get("y").set("isConstant", false)
      
      dragging = {
        mouseConstraint: constraints.moveWithMouse(point)
      }
    redraw()
  
  mouseUp = (x, y) ->
    if dragging
      dragging.mouseConstraint.remove()
      # hack
      point = mouseOn
      constrained = point.get("constrained")
      point.get("x").set("isConstant", constrained)
      point.get("y").set("isConstant", constrained)
  
  click = (x, y) ->
    if g.isNode(mouseOn, "line")
      if key.command
        if selected.indexOf(mouseOn) == -1
          selected.push(mouseOn)
        else
          selected.splice(selected.indexOf(mouseOn), 1)
      else
        selected = [mouseOn]
    # if g.isNode(mouseOn, "line")
    #   line = mouseOn
    #   constraint = line.get("constrained")
    #   if constraint
    #     line.set("constrained", false)
    #     constraint.remove()
    #   else
    #     p1 = line.get("p1")
    #     p2 = line.get("p2")
    #     p1x = p1.get("x").get("v")
    #     p1y = p1.get("y").get("v")
    #     p2x = p2.get("x").get("v")
    #     p2y = p2.get("y").get("v")
    #     d = numeric.distance([p1x, p1y], [p2x, p2y])
    #     
    #     constraint = constraints.setDistance(p1, p2, d)
    #     line.set("constrained", constraint)
    #     
    # else if g.isNode(mouseOn, "point")
    #   point = mouseOn
    #   toggle = !point.get("constrained")
    #   point.get("x").set("isConstant", toggle)
    #   point.get("y").set("isConstant", toggle)
    #   point.set("constrained", toggle)
    redraw()
  
  
  key "e", () ->
    constraints.equalLength(selected[0], selected[1])
  
  
  
  
  
  window.onmousemove = (e) ->
    x = e.clientX
    y = e.clientY
    
    if potentialClick && numeric.distance([x, y], [potentialClick.x, potentialClick.y]) > 3
      potentialClick = false
    
    mousePos.get("x").set("v", x)
    mousePos.get("y").set("v", y)
    
    if dragging
      dragMove(x, y)
    else
      mouseMove(x, y)
  
  window.onmousedown = (e) ->
    x = e.clientX
    y = e.clientY
    
    e.preventDefault()
    potentialClick = {x: e.clientX, y: e.clientY}
    
    mouseDown(x, y)
  
  window.onmouseup = (e) ->
    x = e.clientX
    y = e.clientY
    
    mouseUp(x, y)
    dragging = false
    
    if potentialClick
      click(x, y)
    potentialClick = false
  
  
  window.onresize = (e) ->
    canvas = document.getElementById("c")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    redraw()