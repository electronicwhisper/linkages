module.exports = () ->
  
  model = require("model")
  
  p1 = model.makePoint(0, 0)
  p2 = model.makePoint(100, 0)
  p3 = model.makePoint(300, 0)
  
  p1.setFixed(true)
  model.makeLine(p1, p2).setFixed(true)
  model.makeLine(p2, p3).setFixed(true)
  
  
  document.onmousemove = (e) ->
    p1.p[0].value = e.clientX-500
    p1.p[1].value = e.clientY-500
    model.solve()
    
    require("render")()
