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
    g.node("point", {x: makeValue(x), y: makeValue(y)})
  
  makeLine = (p1, p2) ->
    g.node("line", {p1: p1, p2: p2, constrained: false})
  
  
  mouseOn = false # keep track of what point or line the mouse is on (or pretty close to at least)
  mousePos = g.node("pseudoPoint", {x: makeValue(0).set("isConstant", true), y: makeValue(0).set("isConstant", true)})
  
  
  
  p1 = makePoint(100, 100)
  p2 = makePoint(200, 100)
  p3 = makePoint(300, 200)
  
  l1 = makeLine(p1, p2)
  l2 = makeLine(p2, p3)
  
  
  

  
  
  constraints = {}
  
  constraints.setDistance = (p1, p2, distance) ->
    makeConstraint((([p1x, p1y, p2x, p2y]) ->
      e = util.distance(p1x, p1y, p2x, p2y) - distance
      return e * e
    ), [p1.get("x"), p1.get("y"), p2.get("x"), p2.get("y")])
  
  constraints.moveWithMouse = (p) ->
    constraints.setDistance(p, mousePos, 0).set("isHard", false)
  
  
  
  
  
  
  
  dragging = false
  
  render(g, mouseOn)
  window.onmousemove = (e) ->
    x = e.clientX
    y = e.clientY
    mousePos.get("x").set("v", x)
    mousePos.get("y").set("v", y)
    
    solve(g)
    
    mouseOn = find(g, x, y)
    
    render(g, mouseOn)
  
  window.onmousedown = (e) ->
    if !dragging && g.isNode(mouseOn, "point")
      dragging = {
        mouseConstraint: constraints.moveWithMouse(mouseOn)
      }
  
  window.onmouseup = (e) ->
    if dragging
      dragging.mouseConstraint.remove()
      dragging = false
  
  window.onclick = (e) ->
    if g.isNode(mouseOn, "line")
      line = mouseOn
      constraint = line.get("constrained")
      if constraint
        line.set("constrained", false)
        constraint.remove()
      else
        p1 = line.get("p1")
        p2 = line.get("p2")
        p1x = p1.get("x").get("v")
        p1y = p1.get("y").get("v")
        p2x = p2.get("x").get("v")
        p2y = p2.get("y").get("v")
        d = util.distance(p1x, p1y, p2x, p2y)
        
        constraint = constraints.setDistance(p1, p2, d)
        line.set("constrained", constraint)
      
      render(g, mouseOn)