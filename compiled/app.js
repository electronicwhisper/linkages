
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
    var find, g, l1, l2, makeConstraint, makeLine, makePoint, makeValue, mouseOn, p1, p2, p3, render;
    g = require("./graph");
    render = require("./render");
    find = require("./find");
    makeValue = function(v) {
      return g.node("value", {
        v: v,
        fixed: false
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
        y: makeValue(y)
      });
    };
    makeLine = function(p1, p2) {
      return g.node("line", {
        p1: p1,
        p2: p2
      });
    };
    mouseOn = false;
    p1 = makePoint(100, 100);
    p2 = makePoint(200, 100);
    p3 = makePoint(300, 200);
    l1 = makeLine(p1, p2);
    l2 = makeLine(p2, p3);
    render(g, mouseOn);
    return document.onmousemove = function(e) {
      var x, y;
      x = e.clientX;
      y = e.clientY;
      mouseOn = find(g, x, y);
      return render(g, mouseOn);
    };
  };

}).call(this);
}, "constraintSystem": function(exports, require, module) {(function() {
  var constraintSystem, setAdd, setRemove,
    __slice = Array.prototype.slice;

  setAdd = function(set, x) {
    if (set.indexOf(x) === -1) return set.push(x);
  };

  setRemove = function(set, x) {
    var i;
    i = set.indexOf(x);
    if (i !== -1) return set.splice(i, 1);
  };

  constraintSystem = function() {
    var constraints, makeCell, makeConstraint, minimize, solve;
    constraints = [];
    makeCell = function(initialValue, isConstant) {
      var o;
      if (initialValue == null) initialValue = 0;
      if (isConstant == null) isConstant = false;
      o = {};
      o.value = initialValue;
      o.isConstant = isConstant;
      o.constraints = [];
      return o;
    };
    makeConstraint = function() {
      var cells, errorFunction, o;
      errorFunction = arguments[0], cells = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      o = {};
      o.errorFunction = errorFunction;
      o.cells = cells;
      o.isHard = true;
      o.remove = function() {
        return cells.forEach(function(cell) {
          return setRemove(cell.constraints, o);
        });
      };
      setAdd(constraints, o);
      cells.forEach(function(cell) {
        return setAdd(cell.constraints, o);
      });
      return o;
    };
    minimize = function() {
      var c, cells, errorFunction;
      errorFunction = arguments[0], cells = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      c = makeConstraint.apply(null, [errorFunction].concat(__slice.call(cells)));
      c.isHard = false;
      return c;
    };
    solve = function() {
      var initial, objective, result, solveFor;
      solveFor = [];
      constraints.forEach(function(constraint) {
        return constraint.cells.forEach(function(cell) {
          if (!cell.isConstant) return setAdd(solveFor, cell);
        });
      });
      objective = function(x) {
        var totalError;
        totalError = 0;
        constraints.forEach(function(constraint) {
          var args, error;
          args = constraint.cells.map(function(cell) {
            var i;
            i = solveFor.indexOf(cell);
            if (i === -1) {
              return cell.value;
            } else {
              return x[i];
            }
          });
          error = constraint.errorFunction.apply(constraint, args);
          if (constraint.isHard) error *= 100;
          return totalError += error;
        });
        return totalError;
      };
      initial = solveFor.map(function(cell) {
        return cell.value;
      });
      result = numeric.uncmin(objective, initial);
      if (result.solution) {
        return solveFor.forEach(function(cell, i) {
          return cell.value = result.solution[i];
        });
      }
    };
    return {
      cell: makeCell,
      constraint: makeConstraint,
      minimize: minimize,
      solve: solve
    };
  };

  module.exports = constraintSystem;

}).call(this);
}, "find": function(exports, require, module) {(function() {
  var threshold;

  threshold = 10;

  module.exports = function(g, x, y) {
    var closest, minDistance;
    minDistance = Infinity;
    closest = false;
    g.all("point").forEach(function(point) {
      var d, px, py;
      px = point.get("x").get("v");
      py = point.get("y").get("v");
      d = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
      if (d < minDistance) {
        minDistance = d;
        return closest = point;
      }
    });
    if (minDistance < threshold) {
      return closest;
    } else {
      return false;
    }
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

  isNode = function(potentialNode) {
    return (potentialNode != null ? typeof potentialNode.id === "function" ? potentialNode.id() : void 0 : void 0) != null;
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
        return;
      }
      links.remove({
        node: node,
        key: key
      });
      attributes[key] = value;
      if (isNode(value)) {
        return links.add({
          node: node,
          target: value,
          key: key,
          type: node.type()
        });
      }
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
}, "model": function(exports, require, module) {(function() {

  module.exports = function(cs) {
    var lines, makeLine, makePoint, mergePoints, points;
    points = [];
    lines = [];
    makePoint = function(x, y) {
      var o;
      o = {};
      o.p = [cs.cell(x), cs.cell(y)];
      o.fixed = false;
      o.setFixed = function(fixed) {
        o.fixed = fixed;
        return o.p.forEach(function(cell) {
          return cell.isConstant = fixed;
        });
      };
      points.push(o);
      return o;
    };
    makeLine = function(p1, p2) {
      var constraint, distance, o;
      o = {};
      o.p1 = p1;
      o.p2 = p2;
      o.fixed = false;
      constraint = void 0;
      distance = function() {
        var x1, x2, y1, y2;
        x1 = o.p1.p[0].value;
        y1 = o.p1.p[1].value;
        x2 = o.p2.p[0].value;
        y2 = o.p2.p[1].value;
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
      };
      o.setFixed = function(fixed) {
        var error, fixedDistance;
        o.fixed = fixed;
        if (fixed) {
          fixedDistance = distance();
          error = function(x1, y1, x2, y2) {
            var d, e;
            d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
            e = fixedDistance - d;
            return e * e;
          };
          return constraint = cs.constraint(error, o.p1.p[0], o.p1.p[1], o.p2.p[0], o.p2.p[1]);
        } else {
          return constraint.remove();
        }
      };
      lines.push(o);
      return o;
    };
    mergePoints = function(p1, p2) {};
    return {
      makePoint: makePoint,
      makeLine: makeLine,
      points: points,
      lines: lines
    };
  };

}).call(this);
}, "render": function(exports, require, module) {(function() {

  module.exports = function(g, mouseOn) {
    var canvas, ctx;
    canvas = document.getElementById("c");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    g.all("point").forEach(function(point) {
      var x, y;
      x = point.get("x").get("v");
      y = point.get("y").get("v");
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = mouseOn === point ? "#f00" : "#000";
      return ctx.fill();
    });
    return g.all("line").forEach(function(line) {
      var x1, x2, y1, y2;
      x1 = line.get("p1").get("x").get("v");
      y1 = line.get("p1").get("y").get("v");
      x2 = line.get("p2").get("x").get("v");
      y2 = line.get("p2").get("y").get("v");
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      return ctx.stroke();
    });
  };

}).call(this);
}});
