"use strict";

var factory = (_, Backbone) => {

    /* *****************************
         BACKBONE-LINEAR-PRIVATE
    ***************************** */
    var flat = require("flat"),
      transformToArray = (object, forceArray) => {
        _.each(forceArray, (path) => {
          if (_.isArray(object[path])) {
            return;
          } else if (object[path] != null) {
            object[path] = [object[path]];
          } else {
            let objInPath = {};
            object = _.chain(object)
              .pairs().map(([key, val]) => {
                if (key.match(RegExp(`^${path}`))) {
                  objInPath[`${key.match(/\.(\w+)$/)[1]}`] = val;
                  return null;
                } else {
                  return [key, val];
                }
              })
              .compact().object().value();
            if (_.size(objInPath)) {
              object[path] = [objInPath];
            } else {
              object[path] = [];
            }
          }
        });
        return object;
      },

      LinearModel = Backbone.Model.extend({
        /* ********************
             BACKBONE 1.2.1
        ******************** */
        parse (resp, options) {
          var parentCall = LinearModel.__super__.parse.call(this, resp, options),
            flatOptions, result, hasForceArray;
          if (parentCall == null || parentCall === "" || parentCall instanceof this.constructor) {
            return parentCall;
          }
          flatOptions = _.clone(_.result(this, "flatOptions"));
          hasForceArray = _.isArray(flatOptions.forceArray);
          if (hasForceArray) {
            flatOptions.safe = true;
          }
          result = LinearModel.flatten(parentCall, flatOptions);
          if (hasForceArray) {
            return transformToArray(result, flatOptions.forceArray);
          } else {
            return result;
          }
        },

        sync (method, model, options = {}) {
          if (method === "create" || method === "update" || method === "patch") {
            let opts = _.extend({}, options,
              method === "patch" ? {attrs : LinearModel.unflatten(
                options.attrs,
                _.result(this, "flatOptions")
              )} : {unflat : true}
            );
            return LinearModel.__super__.sync.call(this, method, model, opts);
          } else {
            return LinearModel.__super__.sync.call(this, method, model, options);
          }
        },

        toJSON (options = {}) {
          if (options.unflat) {
            return LinearModel.unflatten(
              LinearModel.__super__.toJSON.call(this, options),
              _.result(this, "flatOptions")
            );
          } else {
            return LinearModel.__super__.toJSON.call(this, options);
          }
        },


        /* ****************************
             BACKBONE-LINEAR-PUBLIC
        **************************** */
        flatOptions () {
          return {safe : true};
        }

      }, {
        /* ****************
             FLAT 1.6.0
        **************** */
        flatten (target, opts = {}) {
          if (opts.safe == null) {
            opts.safe = true;
          }
          return flat.flatten(target, opts);
        },

        unflatten (target, opts = {}) {
          return flat.unflatten(target, opts);
        }

      });

    return Backbone.LinearModel = LinearModel;
  };

if (typeof define === "function" && define.amd) {
  define(["underscore", "backbone"], (_, Backbone) => {
    global.Backbone.LinearModel = factory(_, Backbone);
  });
} else if (module != null && module.exports) {
  let _ = global._ || require("underscore"),
    Backbone = global.Backbone || require("backbone");
  module.exports = factory(_, Backbone);
}