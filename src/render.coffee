module.exports = () ->
  model = require("model")
  
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
  
  model.points.forEach (point) ->
    ctx.beginPath()
    ctx.arc(point.p[0].value, point.p[1].value, 4, 0, Math.PI*2)
    ctx.fill()
  
  model.lines.forEach (line) ->
    ctx.beginPath()
    ctx.moveTo(line.p1.p[0].value, line.p1.p[1].value)
    ctx.lineTo(line.p2.p[0].value, line.p2.p[1].value)
    ctx.stroke()