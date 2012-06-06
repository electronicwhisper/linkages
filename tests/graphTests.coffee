module.exports.graphTests = (test) ->
  g = require("../src/graph")
  
  setEquals = (a1, a2) ->
    a1.length == a2.length && a1.every (x) -> a2.indexOf(x) != -1
  
  cat = g.node("animal")
  mouse = g.node("animal")
  shark = g.node("animal")
  plant = g.node("vegetable")
  grain = g.node("vegetable")
  
  test.expect(2)
  
  test.ok(setEquals(g.all("animal"), [cat, mouse, shark]), "Getting nodes by type")
  
  cat.set("eats", mouse)
  mouse.set("eats", grain)
  
  test.ok(setEquals(mouse.backLinks(), [cat]))
  
  test.done()