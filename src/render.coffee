module.exports = (g, mouseOn) ->
  canvas = document.getElementById("c")
  ctx = canvas.getContext("2d")
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  g.all("line").forEach (line) ->
    ctx.lineWidth = 1
    ctx.strokeStyle = "#999"
    if line.get("constrained")
      ctx.lineWidth = 3
      ctx.strokeStyle = "#000"
    if mouseOn == line
      ctx.strokeStyle = "#f00"
    
    x1 = line.get("p1").get("x").get("v")
    y1 = line.get("p1").get("y").get("v")
    x2 = line.get("p2").get("x").get("v")
    y2 = line.get("p2").get("y").get("v")
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    
    ctx.stroke()
  
  g.all("point").forEach (point) ->
    ctx.lineWidth = 1
    ctx.fillStyle = ctx.strokeStyle = if mouseOn == point then "#f00" else "#000"
    
    x = point.get("x").get("v")
    y = point.get("y").get("v")
    ctx.beginPath()
    ctx.arc(x, y, 4.5, 0, Math.PI*2)
    ctx.fill()
    
    if point.get("constrained")
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI*2)
      ctx.stroke()