
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
    var model, p1, p2, p3;
    model = require("model");
    p1 = model.makePoint(0, 0);
    p2 = model.makePoint(100, 0);
    p3 = model.makePoint(300, 0);
    p1.setFixed(true);
    model.makeLine(p1, p2).setFixed(true);
    model.makeLine(p2, p3).setFixed(true);
    return document.onmousemove = function(e) {
      p1.p[0].value = e.clientX - 500;
      p1.p[1].value = e.clientY - 500;
      model.solve();
      return require("render")();
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
      c = constraint.apply(null, [errorFunction].concat(__slice.call(cells)));
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
}, "model": function(exports, require, module) {(function() {
  var cs, lines, makeLine, makePoint, points;

  points = [];

  lines = [];

  cs = require("constraintSystem")();

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

  module.exports = {
    makePoint: makePoint,
    makeLine: makeLine,
    solve: cs.solve,
    points: points,
    lines: lines
  };

}).call(this);
}, "render": function(exports, require, module) {(function() {

  module.exports = function() {
    var canvas, ctx, model;
    model = require("model");
    canvas = document.getElementById("c");
    ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 500, 500);
    ctx.clearRect(-500, -500, 1000, 1000);
    model.points.forEach(function(point) {
      ctx.beginPath();
      ctx.arc(point.p[0].value, point.p[1].value, 4, 0, Math.PI * 2);
      return ctx.fill();
    });
    return model.lines.forEach(function(line) {
      ctx.beginPath();
      ctx.moveTo(line.p1.p[0].value, line.p1.p[1].value);
      ctx.lineTo(line.p2.p[0].value, line.p2.p[1].value);
      return ctx.stroke();
    });
  };

}).call(this);
}});
