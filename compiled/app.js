
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
    var click, constraintTypes, cs, dragMove, dragging, find, model, mouseDown, mouseMove, mouseOn, mousePos, mouseUp, potentialClick, redraw, render, selected, solve, util;
    model = require("./model");
    cs = require("./constraintSolver");
    render = require("./render");
    find = require("./find");
    util = require("./util");
    constraintTypes = require("./constraintTypes");
    (function() {
      var canvas, height, n, ps, width, _i, _results;
      canvas = document.getElementById("c");
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      n = 3;
      ps = (function() {
        _results = [];
        for (var _i = 0; 0 <= n ? _i < n : _i > n; 0 <= n ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this).map(function() {
        return model.point([Math.random() * width, Math.random() * height]);
      });
      return ps.forEach(function(p1, i) {
        return ps.slice(i + 1, n).forEach(function(p2) {
          return model.line(p1, p2);
        });
      });
    })();
    mouseOn = false;
    mousePos = cs.cell([0, 0]);
    selected = [];
    solve = function() {
      return cs.solve(model.all.constraint);
    };
    redraw = function() {
      return render(mouseOn, selected);
    };
    redraw();
    setTimeout(function() {
      model.constraint({
        constraintType: "fixLength",
        line: model.all.line[0],
        distance: 100
      });
      solve();
      return redraw();
    }, 1000);
    dragging = false;
    potentialClick = false;
    mouseMove = function(pos) {
      mouseOn = find(pos);
      return redraw();
    };
    dragMove = function(pos) {
      solve();
      return redraw();
    };
    mouseDown = function(pos) {
      return redraw();
    };
    mouseUp = function(pos) {};
    click = function(pos) {
      if (mouseOn && mouseOn.type === "line") {
        if (key.command) {
          if (selected.indexOf(mouseOn) === -1) {
            selected.push(mouseOn);
          } else {
            selected.splice(selected.indexOf(mouseOn), 1);
          }
        } else {
          selected = [mouseOn];
        }
      }
      return redraw();
    };
    window.onmousemove = function(e) {
      var pos;
      pos = [e.clientX, e.clientY];
      mousePos(pos);
      if (potentialClick && numeric.distance(pos, potentialClick) > 3) {
        potentialClick = false;
      }
      if (dragging) {
        return dragMove(pos);
      } else {
        return mouseMove(pos);
      }
    };
    window.onmousedown = function(e) {
      var pos;
      pos = [e.clientX, e.clientY];
      e.preventDefault();
      potentialClick = pos;
      return mouseDown(pos);
    };
    window.onmouseup = function(e) {
      var pos;
      pos = [e.clientX, e.clientY];
      mouseUp(pos);
      dragging = false;
      if (potentialClick) click(pos);
      return potentialClick = false;
    };
    return window.onresize = function(e) {
      var canvas;
      canvas = document.getElementById("c");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
    var cell, cellArray, id, initial, objective, result, setValues, solveFor;
    solveFor = {};
    constraints.forEach(function(constraint) {
      return mergeInto(solveFor, collect(constraint));
    });
    for (id in solveFor) {
      if (!__hasProp.call(solveFor, id)) continue;
      cell = solveFor[id];
      if (cell.constant) delete solveFor[id];
    }
    cellArray = objValues(solveFor);
    if (cellArray.length === 0) return true;
    initial = [];
    cellArray.forEach(function(cell) {
      var v;
      v = cell();
      if (v.length) {
        return initial.push.apply(initial, v);
      } else {
        return initial.push(v);
      }
    });
    setValues = function(values) {
      var i;
      i = 0;
      return cellArray.forEach(function(cell) {
        var v;
        v = cell();
        if (v.length) {
          cell(values.slice(i, (i + v.length)));
          return i += v.length;
        } else {
          cell(values[i]);
          return i += 1;
        }
      });
    };
    objective = function(x) {
      var totalError;
      setValues(x);
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
      setValues(result.solution);
      return true;
    } else {
      initial.forEach(function(originalValue, i) {
        return solveFor[i](originalValue);
      });
      return false;
    }
  };

  module.exports = {
    cell: makeCell,
    solve: solve
  };

}).call(this);
}, "constraintTypes": function(exports, require, module) {(function() {

  module.exports = {
    "equalLength": function(constraint) {
      var e, length;
      length = constraint.lines[0].length();
      e = 0;
      constraint.lines.forEach(function(line) {
        return e += numeric.sqr(line.length() - length);
      });
      return e;
    },
    "fixLength": function(constraint) {
      return numeric.sqr(constraint.line.length() - constraint.distance);
    },
    "parallel": function(constraint) {
      var e, slope;
      slope = constraint.lines[0].slope();
      e = 0;
      constraint.lines.forEach(function(line) {
        return e += numeric.sqr(numeric.area(slope, line.slope()));
      });
      return e;
    },
    "fixSlope": function(constraint) {
      return numeric.sqr(numeric.area(constraint.slope, constraint.line.slope()));
    }
  };

}).call(this);
}, "find": function(exports, require, module) {(function() {
  var lineThreshold, model, pointThreshold, util;

  util = require("./util");

  model = require("./model");

  pointThreshold = 10;

  lineThreshold = 4;

  module.exports = function(pos) {
    var closest, minDistance;
    minDistance = 0;
    closest = false;
    model.all.point.forEach(function(point) {
      var d;
      d = numeric.distance(point(), pos) - pointThreshold;
      if (d < minDistance) {
        minDistance = d;
        return closest = point;
      }
    });
    model.all.line.forEach(function(line) {
      var d;
      d = numeric.distancePointToLineSegment(pos, line.p1(), line.p2()) - lineThreshold;
      if (d < minDistance) {
        minDistance = d;
        return closest = line;
      }
    });
    return closest;
  };

}).call(this);
}, "model": function(exports, require, module) {(function() {
  var all, constraintTypes, cs, make, makeConstraint, makeLine, makePoint, util,
    __hasProp = Object.prototype.hasOwnProperty;

  cs = require("./constraintSolver");

  constraintTypes = require("./constraintTypes");

  util = require("./util");

  all = {
    point: [],
    line: [],
    constraint: []
  };

  make = function(type, o) {
    all[type].push(o);
    o.type = type;
    o.remove = function() {
      var i;
      i = all[type].indexOf(o);
      if (i !== -1) return all[type].splice(i, 1);
    };
    return o;
  };

  makePoint = function(location) {
    var point;
    if (location == null) location = [0, 0];
    return point = make("point", cs.cell(location));
  };

  makeLine = function(p1, p2) {
    var line;
    return line = make("line", {
      p1: p1,
      p2: p2,
      length: function() {
        return numeric.distance(line.p1(), line.p2());
      },
      slope: function() {
        var norm, v;
        v = numeric.sub(line.p2(), line.p1());
        norm = numeric.norm2(v);
        return numeric.div(v, norm);
      }
    });
  };

  makeConstraint = function(props) {
    var constraint, k, v;
    constraint = make("constraint", function() {
      return constraintTypes[constraint.constraintType](constraint);
    });
    for (k in props) {
      if (!__hasProp.call(props, k)) continue;
      v = props[k];
      constraint[k] = v;
    }
    return constraint;
  };

  module.exports = {
    point: makePoint,
    line: makeLine,
    constraint: makeConstraint,
    all: all
  };

}).call(this);
}, "render": function(exports, require, module) {(function() {
  var model;

  model = require("./model");

  module.exports = function(mouseOn, selected) {
    var canvas, ctx;
    canvas = document.getElementById("c");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    model.all.line.forEach(function(line) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#000";
      if (line === mouseOn) ctx.strokeStyle = "#f00";
      if (selected.indexOf(line) !== -1) ctx.strokeStyle = "#00f";
      ctx.beginPath();
      ctx.moveTo(line.p1()[0], line.p1()[1]);
      ctx.lineTo(line.p2()[0], line.p2()[1]);
      return ctx.stroke();
    });
    return model.all.point.forEach(function(point) {
      ctx.fillStyle = "#000";
      if (point === mouseOn) ctx.fillStyle = "#f00";
      ctx.beginPath();
      ctx.arc(point()[0], point()[1], 4.5, 0, Math.PI * 2);
      return ctx.fill();
    });
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

  numeric.sqr = function(x) {
    return x * x;
  };

  numeric.area = function(v1, v2) {
    return v1[0] * v2[1] - v1[1] * v2[0];
  };

  module.exports = {};

}).call(this);
}});
