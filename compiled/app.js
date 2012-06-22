
(function(/*! Stitch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var path = expand(root, name), module = cache[path], fn;
      if (module) {
        return module.exports;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: path, exports: {}};
        try {
          cache[path] = module;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return module.exports;
        } catch (err) {
          delete cache[path];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    }
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
  return this.require.define;
}).call(this)({"app": function(exports, require, module) {(function() {

  module.exports = function() {
    var constraints, dragging, find, g, makeConstraint, makeLine, makePoint, makeValue, mouseOn, mousePos, potentialClick, redraw, render, solve, util;
    g = require("./graph");
    render = require("./render");
    find = require("./find");
    solve = require("./solve");
    util = require("./util");
    makeValue = function(v) {
      return g.node("value", {
        v: v,
        isConstant: false
      });
    };
    makeConstraint = function(f, values) {
      var constraint;
      constraint = g.node("constraint", {
        f: f,
        isHard: true,
        argLength: values.length
      });
      values.forEach(function(value, i) {
        return constraint.set("arg" + i, value);
      });
      return constraint;
    };
    makePoint = function(x, y) {
      return g.node("point", {
        x: makeValue(x),
        y: makeValue(y),
        constrained: false
      });
    };
    makeLine = function(p1, p2) {
      return g.node("line", {
        p1: p1,
        p2: p2,
        constrained: false
      });
    };
    mouseOn = false;
    mousePos = g.node("pseudoPoint", {
      x: makeValue(0).set("isConstant", true),
      y: makeValue(0).set("isConstant", true)
    });
    (function() {
      var canvas, height, n, ps, width, _i, _results;
      canvas = document.getElementById("c");
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      n = 6;
      ps = (function() {
        _results = [];
        for (var _i = 0; 0 <= n ? _i < n : _i > n; 0 <= n ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function() {
        return makePoint(Math.random() * width, Math.random() * height);
      });
      return ps.forEach(function(p1, i) {
        return ps.slice(i + 1, n).forEach(function(p2) {
          return makeLine(p1, p2);
        });
      });
    })();
    constraints = {};
    constraints.setDistance = function(p1, p2, distance) {
      return makeConstraint((function(_arg) {
        var e, p1x, p1y, p2x, p2y;
        p1x = _arg[0], p1y = _arg[1], p2x = _arg[2], p2y = _arg[3];
        e = numeric.distance([p1x, p1y], [p2x, p2y]) - distance;
        return e * e;
      }), [p1.get("x"), p1.get("y"), p2.get("x"), p2.get("y")]);
    };
    constraints.moveWithMouse = function(p) {
      return constraints.setDistance(p, mousePos, 0).set("isHard", false);
    };
    redraw = function() {
      return render(g, mouseOn);
    };
    dragging = false;
    potentialClick = false;
    redraw();
    window.onmousemove = function(e) {
      var x, y;
      x = e.clientX;
      y = e.clientY;
      if (potentialClick && numeric.distance([x, y], [potentialClick.x, potentialClick.y]) > 3) {
        potentialClick = false;
      }
      mousePos.get("x").set("v", x);
      mousePos.get("y").set("v", y);
      solve(g);
      if (!dragging) mouseOn = find(g, x, y);
      return redraw();
    };
    window.onmousedown = function(e) {
      var point;
      e.preventDefault();
      potentialClick = {
        x: e.clientX,
        y: e.clientY
      };
      if (!dragging && g.isNode(mouseOn, "point")) {
        point = mouseOn;
        point.get("x").set("isConstant", false);
        point.get("y").set("isConstant", false);
        dragging = {
          mouseConstraint: constraints.moveWithMouse(point)
        };
      }
      return redraw();
    };
    window.onmouseup = function(e) {
      var constrained, constraint, d, line, p1, p1x, p1y, p2, p2x, p2y, point, toggle;
      if (dragging) {
        dragging.mouseConstraint.remove();
        point = mouseOn;
        constrained = point.get("constrained");
        point.get("x").set("isConstant", constrained);
        point.get("y").set("isConstant", constrained);
      }
      dragging = false;
      if (potentialClick) {
        if (g.isNode(mouseOn, "line")) {
          line = mouseOn;
          constraint = line.get("constrained");
          if (constraint) {
            line.set("constrained", false);
            constraint.remove();
          } else {
            p1 = line.get("p1");
            p2 = line.get("p2");
            p1x = p1.get("x").get("v");
            p1y = p1.get("y").get("v");
            p2x = p2.get("x").get("v");
            p2y = p2.get("y").get("v");
            d = numeric.distance([p1x, p1y], [p2x, p2y]);
            constraint = constraints.setDistance(p1, p2, d);
            line.set("constrained", constraint);
          }
        } else if (g.isNode(mouseOn, "point")) {
          point = mouseOn;
          toggle = !point.get("constrained");
          point.get("x").set("isConstant", toggle);
          point.get("y").set("isConstant", toggle);
          point.set("constrained", toggle);
        }
      }
      potentialClick = false;
      return redraw();
    };
    return window.onresize = function(e) {
      var canvas, height, width;
      canvas = document.getElementById("c");
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      return redraw();
    };
  };

}).call(this);
}, "constraintSolver": function(exports, require, module) {(function() {
  var accessed, collect, idCount, makeCell, makeId, mergeInto, objValues, solve,
    __hasProp = Object.prototype.hasOwnProperty;

  idCount = 0;

  makeId = function() {
    return "" + idCount++;
  };

  mergeInto = function(o, o2) {
    var k, v, _results;
    _results = [];
    for (k in o2) {
      if (!__hasProp.call(o2, k)) continue;
      v = o2[k];
      _results.push(o[k] = v);
    }
    return _results;
  };

  objValues = function(o) {
    var k, ret, v;
    ret = [];
    for (k in o) {
      if (!__hasProp.call(o, k)) continue;
      v = o[k];
      ret.push(v);
    }
    return ret;
  };

  accessed = false;

  makeCell = function(value) {
    var cell, id;
    if (value == null) value = 0;
    id = makeId();
    return cell = function(newValue) {
      if (newValue != null) {
        return value = newValue;
      } else {
        if (accessed) accessed[id] = cell;
        return value;
      }
    };
  };

  collect = function(f) {
    var cells;
    accessed = {};
    f();
    cells = accessed;
    accessed = false;
    return cells;
  };

  solve = function(constraints) {
    var cell, id, initial, objective, result, solveFor;
    solveFor = {};
    constraints.forEach(function(constraint) {
      return mergeInto(solveFor, collect(constraint));
    });
    for (id in solveFor) {
      if (!__hasProp.call(solveFor, id)) continue;
      cell = solveFor[id];
      if (cell.constant) delete solveFor[id];
    }
    solveFor = objValues(solveFor);
    if (solveFor.length === 0) return;
    initial = solveFor.map(function(cell) {
      return cell();
    });
    objective = function(x) {
      var totalError;
      solveFor.forEach(function(cell, i) {
        return cell(x[i]);
      });
      totalError = 0;
      constraints.forEach(function(constraint) {
        var error;
        error = constraint();
        if (constraint.soft) error *= .001;
        return totalError += error;
      });
      return totalError;
    };
    result = numeric.uncmin(objective, initial);
    if (result.solution) {
      return true;
    } else {
      initial.forEach(function(originalValue, i) {
        return solveFor[i](originalValue);
      });
      return false;
    }
  };

  return {
    cell: makeCell,
    solve: solve
  };

}).call(this);
}, "find": function(exports, require, module) {(function() {
  var lineThreshold, pointThreshold, util;

  util = require("./util");

  pointThreshold = 10;

  lineThreshold = 4;

  module.exports = function(g, x, y) {
    var closest, minDistance;
    minDistance = 0;
    closest = false;
    g.all("point").forEach(function(point) {
      var d, px, py;
      px = point.get("x").get("v");
      py = point.get("y").get("v");
      d = numeric.distance([px, py], [x, y]) - pointThreshold;
      if (d < minDistance) {
        minDistance = d;
        return closest = point;
      }
    });
    g.all("line").forEach(function(line) {
      var d, l1x, l1y, l2x, l2y;
      l1x = line.get("p1").get("x").get("v");
      l1y = line.get("p1").get("y").get("v");
      l2x = line.get("p2").get("x").get("v");
      l2y = line.get("p2").get("y").get("v");
      d = numeric.distancePointToLineSegment([x, y], [l1x, l1y], [l2x, l2y]) - lineThreshold;
      if (d < minDistance) {
        minDistance = d;
        return closest = line;
      }
    });
    return closest;
  };

}).call(this);
}, "graph": function(exports, require, module) {(function() {
  var all, idCount, indexedTable, isNode, links, makeId, makeNode, nodes,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty;

  indexedTable = require("./indexedTable");

  idCount = 0;

  makeId = function() {
    return "" + idCount++;
  };

  nodes = indexedTable("node", "type");

  links = indexedTable("node", "target");

  isNode = function(node, type) {
    if ((node != null ? typeof node.id === "function" ? node.id() : void 0 : void 0) != null) {
      if (type) {
        return node.type() === type;
      } else {
        return true;
      }
    }
  };

  makeNode = function(type, initialSet) {
    var attributes, id, node;
    node = {};
    id = makeId();
    attributes = {};
    node.id = node.toString = function() {
      return id;
    };
    node.type = function() {
      return type;
    };
    node.get = function(key) {
      return attributes[key];
    };
    node.set = function(key, value) {
      var k, v;
      if (typeof key === "object") {
        for (k in key) {
          v = key[k];
          node.set(k, v);
        }
      } else {
        links.remove({
          node: node,
          key: key
        });
        attributes[key] = value;
        if (isNode(value)) {
          links.add({
            node: node,
            target: value,
            key: key,
            type: node.type()
          });
        }
      }
      return node;
    };
    node.attributes = function() {
      return attributes;
    };
    node.backLinks = function(type, key) {
      var query;
      query = {
        target: node
      };
      if (type != null) query.type = type;
      if (key != null) query.key = key;
      return links.find(query).map(function(link) {
        return link.node;
      });
    };
    node.remove = function() {
      nodes.remove({
        node: node
      });
      links.remove({
        node: node
      });
      return node.backLinks().forEach(function(n) {
        return n.remove();
      });
    };
    node.merge = function() {
      var mergedNodes;
      mergedNodes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      mergedNodes.forEach(function(n) {
        var key, value, _ref, _results;
        _ref = n.attributes();
        _results = [];
        for (key in _ref) {
          if (!__hasProp.call(_ref, key)) continue;
          value = _ref[key];
          if (isNode(value)) {
            _results.push(mergeNodes(node.get(key), value));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      mergedNodes.forEach(function(n) {
        return links.find({
          target: n
        }).forEach(function(link) {
          return link.node.set(link.key, node);
        });
      });
      return mergedNodes.forEach(function(n) {
        return n.remove();
      });
    };
    if (initialSet) node.set(initialSet);
    nodes.add({
      node: node,
      type: node.type()
    });
    return node;
  };

  all = function(type) {
    var query;
    query = {};
    if (type != null) query.type = type;
    return nodes.find(query).map(function(res) {
      return res.node;
    });
  };

  module.exports = {
    node: makeNode,
    isNode: isNode,
    all: all
  };

}).call(this);
}, "indexedTable": function(exports, require, module) {(function() {
  var autovivify,
    __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty;

  autovivify = function() {
    var hash, keys, ret;
    hash = arguments[0], keys = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    ret = hash;
    keys.forEach(function(key) {
      if (ret[key] != null) {
        return ret = ret[key];
      } else {
        return ret = ret[key] = {};
      }
    });
    return ret;
  };

  module.exports = function() {
    var add, find, idCount, index, indexKeys, makeId, match, remove, table;
    indexKeys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    idCount = 0;
    makeId = function() {
      return "" + idCount++;
    };
    table = {};
    index = {};
    add = function(item) {
      var id;
      id = makeId();
      table[id] = item;
      return indexKeys.forEach(function(indexKey) {
        return autovivify(index, indexKey, item[indexKey])[id] = item;
      });
    };
    match = function(needle, item) {
      var key, ret, value;
      ret = true;
      for (key in needle) {
        if (!__hasProp.call(needle, key)) continue;
        value = needle[key];
        if (item[key] !== value) ret = false;
      }
      return ret;
    };
    find = function(needle, returnIds) {
      var id, item, key, ret, search, value;
      if (needle == null) needle = {};
      if (returnIds == null) returnIds = false;
      search = table;
      for (key in needle) {
        if (!__hasProp.call(needle, key)) continue;
        value = needle[key];
        if (index[key]) search = index[key][value];
      }
      ret = [];
      for (id in search) {
        if (!__hasProp.call(search, id)) continue;
        item = search[id];
        if (match(needle, item)) {
          if (returnIds) {
            ret.push(id);
          } else {
            ret.push(item);
          }
        }
      }
      return ret;
    };
    remove = function(needle) {
      var ids;
      if (needle == null) needle = {};
      ids = find(needle, true);
      return ids.forEach(function(id) {
        indexKeys.forEach(function(indexKey) {
          return delete autovivify(index, indexKey, table[id][indexKey])[id];
        });
        return delete table[id];
      });
    };
    return {
      add: add,
      find: function(needle) {
        return find(needle);
      },
      remove: remove
    };
  };

}).call(this);
}, "render": function(exports, require, module) {(function() {

  module.exports = function(g, mouseOn) {
    var canvas, ctx;
    canvas = document.getElementById("c");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    g.all("line").forEach(function(line) {
      var x1, x2, y1, y2;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#999";
      if (line.get("constrained")) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
      }
      if (mouseOn === line) ctx.strokeStyle = "#f00";
      x1 = line.get("p1").get("x").get("v");
      y1 = line.get("p1").get("y").get("v");
      x2 = line.get("p2").get("x").get("v");
      y2 = line.get("p2").get("y").get("v");
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      return ctx.stroke();
    });
    return g.all("point").forEach(function(point) {
      var x, y;
      ctx.lineWidth = 1;
      ctx.fillStyle = ctx.strokeStyle = mouseOn === point ? "#f00" : "#000";
      x = point.get("x").get("v");
      y = point.get("y").get("v");
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      if (point.get("constrained")) {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        return ctx.stroke();
      }
    });
  };

}).call(this);
}, "solve": function(exports, require, module) {(function() {
  var constraintValues, objValues,
    __hasProp = Object.prototype.hasOwnProperty;

  constraintValues = function(constraint) {
    var i, ret, _ref;
    ret = [];
    for (i = 0, _ref = constraint.get("argLength"); 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      ret.push(constraint.get("arg" + i));
    }
    return ret;
  };

  objValues = function(o) {
    var k, ret, v;
    ret = [];
    for (k in o) {
      if (!__hasProp.call(o, k)) continue;
      v = o[k];
      ret.push(v);
    }
    return ret;
  };

  module.exports = function(g) {
    var initial, objective, result, solveFor;
    solveFor = {};
    g.all("constraint").forEach(function(constraint) {
      return constraintValues(constraint).forEach(function(value) {
        if (!value.get("isConstant")) return solveFor[value.id()] = value;
      });
    });
    solveFor = objValues(solveFor);
    if (solveFor.length === 0) return;
    initial = solveFor.map(function(value) {
      return value.get("v");
    });
    objective = function(x) {
      var totalError;
      totalError = 0;
      g.all("constraint").forEach(function(constraint) {
        var args, error;
        args = constraintValues(constraint).map(function(value) {
          var i;
          i = solveFor.indexOf(value);
          if (i === -1) {
            return value.get("v");
          } else {
            return x[i];
          }
        });
        error = constraint.get("f")(args);
        if (!constraint.get("isHard")) error *= .001;
        return totalError += error;
      });
      return totalError;
    };
    result = numeric.uncmin(objective, initial);
    if (result.solution) {
      return solveFor.forEach(function(value, i) {
        return value.set("v", result.solution[i]);
      });
    }
  };

}).call(this);
}, "util": function(exports, require, module) {(function() {

  numeric.distance = function(p1, p2) {
    var normalized;
    normalized = numeric.sub(p1, p2);
    return Math.sqrt(numeric.dot(normalized, normalized));
  };

  numeric.projectPointToLineSegment = function(p, a, b) {
    var ab, abSquared, ap, t;
    ab = numeric.sub(b, a);
    abSquared = numeric.dot(ab, ab);
    if (abSquared === 0) {
      return a;
    } else {
      ap = numeric.sub(p, a);
      t = numeric.dot(ap, ab) / abSquared;
      if (t < 0) {
        return a;
      } else if (t > 1) {
        return b;
      } else {
        return numeric.add(a, numeric.mul(t, ab));
      }
    }
  };

  numeric.distancePointToLineSegment = function(p, a, b) {
    var p2;
    p2 = numeric.projectPointToLineSegment(p, a, b);
    return numeric.distance(p, p2);
  };

  module.exports = {};

}).call(this);
}});
