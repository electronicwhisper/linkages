
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
  var __slice = Array.prototype.slice;

  module.exports = function() {
    var constrainDistance, cs, draw, makePoint, p1, p2, p3;
    cs = require("constraintSystem")();
    makePoint = function() {
      return [cs.cell(Math.random()), cs.cell(Math.random())];
    };
    constrainDistance = function(p1, p2, d) {
      var error;
      error = function(x1, y1, x2, y2) {
        var dist, e, v;
        v = numeric['-']([x1, y1], [x2, y2]);
        dist = Math.sqrt(numeric.dot(v, v));
        e = dist - d;
        return e * e;
      };
      return cs.constraint.apply(cs, [error].concat(__slice.call(p1.concat(p2))));
    };
    p1 = makePoint();
    p2 = makePoint();
    p3 = makePoint();
    constrainDistance(p1, p2, 100);
    constrainDistance(p2, p3, 200);
    p1[0].value = 0;
    p1[0].isConstant = true;
    p1[1].value = 0;
    p1[1].isConstant = true;
    cs.solve();
    console.log(p1);
    console.log(p2);
    draw = function() {
      var canvas, ctx;
      canvas = document.getElementById("c");
      ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 500, 500);
      ctx.clearRect(-500, -500, 1000, 1000);
      ctx.beginPath();
      ctx.arc(p1[0].value, p1[1].value, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p2[0].value, p2[1].value, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p3[0].value, p3[1].value, 10, 0, Math.PI * 2);
      return ctx.fill();
    };
    return document.onmousemove = function(e) {
      p1[0].value = e.clientX - 500;
      p1[1].value = e.clientY - 500;
      cs.solve();
      return draw();
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
}});
