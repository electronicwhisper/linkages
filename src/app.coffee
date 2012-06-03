module.exports = () ->
  cs = require("constraintSystem")()
  
  makePoint = () ->
    return [cs.cell(Math.random()), cs.cell(Math.random())]
  
  constrainDistance = (p1, p2, d) ->
    error = (x1, y1, x2, y2) ->
      v = numeric['-']([x1,y1], [x2,y2])
      dist = Math.sqrt(numeric.dot(v, v))
      e = dist - d
      return e*e
    cs.constraint(error, (p1.concat(p2))...)
  
  
  # x = cs.cell(Math.random())
  # y = cs.cell(Math.random())
  # 
  # dist = (x, y) ->
  #   Math.sqrt(x*x + y*y)
  # 
  # constraint = cs.constraint(((x, y) ->
  #   e = dist(x, y) - 10
  #   return e*e
  #   ), x, y)
  
  p1 = makePoint()
  p2 = makePoint()
  p3 = makePoint()
  constrainDistance(p1, p2, 100)
  constrainDistance(p2, p3, 200)
  
  p1[0].value = 0
  p1[0].isConstant = true
  p1[1].value = 0
  p1[1].isConstant = true
  
  cs.solve()
  
  console.log p1
  console.log p2
  
  
  
  draw = () ->
    
    canvas = document.getElementById("c")
    ctx = canvas.getContext("2d")
    
    ctx.setTransform(1,0,0,1,500,500)
    ctx.clearRect(-500,-500,1000,1000)
    
    # axes
    # ctx.beginPath()
    # ctx.moveTo(0,-500)
    # ctx.lineTo(0,500)
    # ctx.stroke()
    # 
    # ctx.beginPath()
    # ctx.moveTo(-500,0)
    # ctx.lineTo(500,0)
    # ctx.stroke()
    
    ctx.beginPath()
    ctx.arc(p1[0].value, p1[1].value, 10, 0, Math.PI*2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(p2[0].value, p2[1].value, 10, 0, Math.PI*2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.arc(p3[0].value, p3[1].value, 10, 0, Math.PI*2)
    ctx.fill()
  
  
  document.onmousemove = (e) ->
    p1[0].value = e.clientX-500
    p1[1].value = e.clientY-500
    cs.solve()
    draw()
