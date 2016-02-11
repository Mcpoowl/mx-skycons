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
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/text",
    "dojo/html",

    "Skycons/lib/skycons"
], function(declare, _WidgetBase, dom, dojoDom,   dojoClass, dojoStyle, dojoConstruct,  dojoText, dojoHtml, Skycons) {
    "use strict";

    // Declare widget's prototype.
    return declare("Skycons.widget.Skycons", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        mfToExecute: "",
        messageString: "",
        backgroundColor: "",
        icon: "",
        width: "",
        height: "",
        animated: "",
        color: "",

        // Internal variables
        _skyNode: null,

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
          //logger.level(logger.DEBUG);
          logger.debug(this.id + ".postCreate");
        },

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

            logger.debug(this.id + "._createSkycon start");
            //Create a list with all the possible values
            var list = [
              "clear_day", "clear_night", "partly_cloudy_day",
              "partly_cloudy_night", "cloudy", "rain", "sleet", "snow", "wind",
              "fog"],
              //i,
              skycons;

            if (this.coloring === "one"){
              var colorString = this.color;
              skycons = new Skycons({"color": colorString});
            } else {
              logger.debug(this.id + "._createSkycon colored");
              // Colored instance of Skycon
              skycons = new Skycons({"monochrome": false});
            }

            for (var i = list.length; i>=0; i--) {
                var weatherType = list[i],
                    elements = document.getElementsByClassName(weatherType);

                for (var e = elements.length; e >= 0; e--){
                    skycons.set( elements[e], weatherType );
                }
            }

            if (this.animated === true){
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
