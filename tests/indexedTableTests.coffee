module.exports.indexedTableTests = (test) ->
  test.expect(5)
  
  setEquals = (a1, a2) ->
    a1.length == a2.length && a1.every (x) -> a2.indexOf(x) != -1
  
  cat = {name: "cat", speed: "fast", color: "black"}
  fish = {name: "fish", speed: "fast", color: "gold"}
  dog = {name: "dog", speed: "fast", color: "gold"}
  plant = {name: "plant", speed: "slow", color: "green"}
  flower = {name: "flower", speed: "slow", color: "gold"}
  
  it = require("../src/indexedTable")("speed", "color")
  
  it.add(cat)
  it.add(fish)
  it.add(dog)
  it.add(plant)
  it.add(flower)
  
  test.ok(setEquals(it.find(), [cat, fish, dog, plant, flower]), "Find: all items")
  test.ok(setEquals(it.find({speed: "slow"}), [plant, flower]), "Find: on a key")
  test.ok(setEquals(it.find({speed: "fast", color: "gold"}), [fish, dog]), "Find: on two keys")
  test.ok(setEquals(it.find({name: "cat"}), [cat]), "Find: non-indexed key")
  
  it.remove({color: "gold"})
  test.ok(setEquals(it.find(), [cat, plant]), "Removal")
  
  test.done()