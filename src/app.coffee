module.exports = () ->
  
  model = require("./model")
  cs = require("./constraintSolver")
  render = require("./render")
  find = require("./find")
  util = require("./util")
  
  constraintTypes = require("./constraintTypes")
  
  
  
  do ->
    canvas = document.getElementById("c")
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
    
    n = 3
    ps = [0...n].map () -> model.point([Math.random() * width, Math.random() * height])
    ps.forEach (p1, i) ->
      ps[i+1...n].forEach (p2) ->
        model.line(p1, p2)
  
  
  
  
  
  
  
  
  # constraints = {}
  # 
  # constraints.setDistance = (p1, p2, distance) ->
  #   makeConstraint((([p1x, p1y, p2x, p2y]) ->
  #     e = numeric.distance([p1x, p1y], [p2x, p2y]) - distance
  #     return e * e
  #   ), [p1.get("x"), p1.get("y"), p2.get("x"), p2.get("y")])
  # 
  # constraints.moveWithMouse = (p) ->
  #   constraints.setDistance(p, mousePos, 0).set("isHard", false)
  # 
  # constraints.equalLength = (l1, l2) ->
  #   # initialLength = numeric.distance([l1.get("p1").get("x"), l1.get("p1").get("y")], [l1.get("p2").get("x"), l1.get("p2").get("y")])
  #   # length = makeValue(initialLength)
  #   makeConstraint((([p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y]) ->
  #     d1 = numeric.distance([p1x, p1y], [p2x, p2y])
  #     d2 = numeric.distance([p3x, p3y], [p4x, p4y])
  #     e = d1 - d2
  #     return e * e
  #   ), [l1.get("p1").get("x"), l1.get("p1").get("y"), l1.get("p2").get("x"), l1.get("p2").get("y"), l2.get("p1").get("x"), l2.get("p1").get("y"), l2.get("p2").get("x"), l2.get("p2").get("y")])
  # 
  # 
  # # constraints.equalLength(lines) ->
  # #   initialLength = numeric.distance([lines[0].get("p1").get("x"), lines[0].get("p1").get("y")], [lines[0].get("p2").get("x"), lines[0].get("p2").get("y")])
  # #   makeValue(initialLength)
  # #   makeConstraint(((l, ps...) ->
  # #     
  # #   ), )
  # 
  # 
  # 
  # 
  # 
  # 
  # 
  mouseOn = false # keep track of what point or line the mouse is on
  mousePos = cs.cell([0, 0])
  
  selected = []
  
  
  
  solve = () ->
    cs.solve(model.all.constraint)
  
  redraw = () ->
    render(mouseOn, selected)
  
  redraw()
  
  
  
  setTimeout(() ->
    # model.constraint({
    #   type: "equalLength",
    #   lines: [model.all.lines[0], model.all.lines[1]]
    # })
    # model.constraint({
    #   type: "equalLength",
    #   lines: [model.all.lines[2], model.all.lines[3]]
    # })
    model.constraint({
      constraintType: "fixLength",
      line: model.all.line[0]
      distance: 100
    })
    # model.constraint({
    #   constraintType: "fixSlope",
    #   line: model.all.line[0]
    #   slope: [1, 0]
    # })
    solve()
    redraw()
  , 1000)
  
  
  
  dragging = false
  potentialClick = false
  
  mouseMove = (pos) ->
    mouseOn = find(pos)
    redraw()
  
  dragMove = (pos) ->
    solve()
    redraw()
  
  mouseDown = (pos) ->
    # if g.isNode(mouseOn, "point")
    #   point = mouseOn
    #   
    #   dragging = {
    #     mouseConstraint: constraints.moveWithMouse(point)
    #   }
    redraw()
  
  mouseUp = (pos) ->
    # if dragging
    #   dragging.mouseConstraint.remove()
    #   # hack
    #   point = mouseOn
    #   constrained = point.get("constrained")
    #   point.get("x").set("isConstant", constrained)
    #   point.get("y").set("isConstant", constrained)
  
  click = (pos) ->
    if mouseOn && mouseOn.type == "line"
      if key.command
        if selected.indexOf(mouseOn) == -1
          selected.push(mouseOn)
        else
          selected.splice(selected.indexOf(mouseOn), 1)
      else
        selected = [mouseOn]
    redraw()
  # 
  # 
  # key "e", () ->
  #   constraints.equalLength(selected[0], selected[1])
  # 
  # 
  # 
  # 
  # 
  window.onmousemove = (e) ->
    pos = [e.clientX, e.clientY]
    
    mousePos(pos)
    
    if potentialClick && numeric.distance(pos, potentialClick) > 3
      potentialClick = false
    
    if dragging
      dragMove(pos)
    else
      mouseMove(pos)
  
  window.onmousedown = (e) ->
    pos = [e.clientX, e.clientY]
    
    e.preventDefault()
    potentialClick = pos
    
    mouseDown(pos)
  
  window.onmouseup = (e) ->
    pos = [e.clientX, e.clientY]
    
    mouseUp(pos)
    dragging = false
    
    if potentialClick
      click(pos)
    potentialClick = false
  
  
  window.onresize = (e) ->
    canvas = document.getElementById("c")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    redraw()