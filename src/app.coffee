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
  
  
  mouseOn = false # keep track of what point or line the mouse is on (or pretty close to at least)
  mousePos = g.node("pseudoPoint", {x: makeValue(0).set("isConstant", true), y: makeValue(0).set("isConstant", true)})
  
  
  do ->
    canvas = document.getElementById("c")
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    
    n = 5
    ps = [0...n].map () -> makePoint(Math.random() * width, Math.random() * height)
    ps.forEach (p1, i) ->
      ps[i+1...n].forEach (p2) ->
        makeLine(p1, p2)
  
  
  

  
  
  constraints = {}
  
  constraints.setDistance = (p1, p2, distance) ->
    makeConstraint((([p1x, p1y, p2x, p2y]) ->
      e = util.distance(p1x, p1y, p2x, p2y) - distance
      return e * e
    ), [p1.get("x"), p1.get("y"), p2.get("x"), p2.get("y")])
  
  constraints.moveWithMouse = (p) ->
    constraints.setDistance(p, mousePos, 0).set("isHard", false)
  
  
  
  
  redraw = () ->
    render(g, mouseOn)
  
  
  dragging = false
  
  potentialClick = false
  
  redraw()
  
  window.onmousemove = (e) ->
    x = e.clientX
    y = e.clientY
    
    if potentialClick && util.distance(x, y, potentialClick.x, potentialClick.y) > 3
      potentialClick = false
    
    mousePos.get("x").set("v", x)
    mousePos.get("y").set("v", y)
    
    solve(g)
    
    if !dragging
      mouseOn = find(g, x, y)
    
    redraw()
  
  window.onmousedown = (e) ->
    e.preventDefault()
    potentialClick = {x: e.clientX, y: e.clientY}
    if !dragging && g.isNode(mouseOn, "point")
      point = mouseOn
      
      #hack
      point.get("x").set("isConstant", false)
      point.get("y").set("isConstant", false)
      
      dragging = {
        mouseConstraint: constraints.moveWithMouse(point)
      }
    redraw()
  
  window.onmouseup = (e) ->
    if dragging
      dragging.mouseConstraint.remove()
      # hack
      point = mouseOn
      constrained = point.get("constrained")
      point.get("x").set("isConstant", constrained)
      point.get("y").set("isConstant", constrained)
    dragging = false
    
    if potentialClick
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
          
      else if g.isNode(mouseOn, "point")
        point = mouseOn
        toggle = !point.get("constrained")
        point.get("x").set("isConstant", toggle)
        point.get("y").set("isConstant", toggle)
        point.set("constrained", toggle)
    potentialClick = false
    
    redraw()
  
  
  window.onresize = (e) ->
    canvas = document.getElementById("c")
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    redraw()