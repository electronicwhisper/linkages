module.exports = () ->
  
  g = require("./graph")
  render = require("./render")
  find = require("./find")
  
  makeValue = (v) ->
    g.node("value", {v: v, fixed: false})
  
  makeConstraint = (f, values) ->
    constraint = g.node("constraint", {f: f, isHard: true, argLength: values.length})
    values.forEach (value, i) ->
      constraint.set("arg"+i, value)
    return constraint
  
  makePoint = (x, y) ->
    g.node("point", {x: makeValue(x), y: makeValue(y)})
  
  makeLine = (p1, p2) ->
    g.node("line", {p1: p1, p2: p2})
  
  
  mouseOn = false # keep track of what point or line the mouse is on (or pretty close to at least)
  
  
  
  
  p1 = makePoint(100, 100)
  p2 = makePoint(200, 100)
  p3 = makePoint(300, 200)
  
  l1 = makeLine(p1, p2)
  l2 = makeLine(p2, p3)
  
  
  
  
  
  
  
  render(g, mouseOn)
  document.onmousemove = (e) ->
    x = e.clientX
    y = e.clientY
    mouseOn = find(g, x, y)
    render(g, mouseOn)
  
  
  
  # cs = require("./constraintSystem")()
  # model = require("./model")(cs)
  # 
  # p1 = model.makePoint(0, 0)
  # p2 = model.makePoint(100, 0)
  # p3 = model.makePoint(300, 0)
  # p4 = model.makePoint(100, 100)
  # 
  # # p1.setFixed(true)
  # model.makeLine(p1, p2).setFixed(true)
  # model.makeLine(p2, p3).setFixed(true)
  # model.makeLine(p2, p4).setFixed(true)
  # model.makeLine(p3, p4).setFixed(true)
  # 
  # p3.setFixed(true)
  # 
  # mouse = model.makePoint(0, 0)
  # mouse.setFixed(true)
  # 
  # constraint = cs.minimize(((x1, y1, x2, y2) ->
  #   return ((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
  # ), mouse.p[0], mouse.p[1], p1.p[0], p1.p[1])
  # 
  # document.onmousemove = (e) ->
  #   mouse.p[0].value = e.clientX-500
  #   mouse.p[1].value = e.clientY-500
  #   
  #   
  #   
  #   cs.solve()
  #   
  #   # constraint.remove()
  #   
  #   require("./render")(model)
