/*global logger*/
/*
    Skycons
    ========================

    @file      : Skycons.js
    @version   : 1.0.0
    @author    : Willem van Zantvoort & Paul Ketelaars
    @date      : 2016-02-09
    @copyright : Timeseries Consulting 2016
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
  "dojo/_base/declare",
  "mxui/widget/_WidgetBase",
  "mxui/dom",
  "dojo/dom",
  "dojo/query",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/dom-construct",
  "dojo/text",
  "dojo/html",
  "Skycons/lib/skycons"
], function (declare, _WidgetBase, dom, dojoDom, dojoQuery, dojoClass, dojoStyle, dojoConstruct, dojoText, dojoHtml, Skycons) {
    "use strict";

    // Declare widget"s prototype.
    return declare("Skycons.widget.Skycons", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        icon: "",
        width: "",
        height: "",
        animated: "",
        color: "",

        // Internal variables
        _skyNode: null,

        update: function (obj, callback) {
          logger.debug(this.id + ".update");
          if (this._skyNode === null) {
            // callback is called when the widget is ready (the domNode is created)
            this._createSkycon(callback);
          } else {
            callback();
          }
        },

        _createSkycon: function (callback) {
            logger.debug(this.id + "._createSkycon create domNode");

            this._skyNode = dojoConstruct.create("canvas", {
                class: this.icon,
                width: this.width,
                height: this.height
            }, this.domNode, "only");

            var skyconsOptions = {};
            if (this.coloring === "one"){
              skyconsOptions = {
                "color": this.color
              };
            } else {
              skyconsOptions = {
                "monochrome": false
              };
            }

            var skycons = new Skycons(skyconsOptions);
            skycons.add(this._skyNode, this.icon);

            if (this.animated === true) {
                skycons.play();
            }

            if (typeof callback === "function") {
              callback();
            }
        }
    });
});

require(["Skycons/widget/Skycons"], function() {
    "use strict";
});
