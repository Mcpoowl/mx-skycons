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
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "Skycons/lib/jquery-1.11.2",
    "Skycons/lib/skycons",
    "dojo/text!Skycons/widget/template/Skycons.html"
], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, domConstruct, dojoEvent, widgetTemplate) {
    "use strict";


    // Declare widget's prototype.
    return declare("Skycons.widget.Skycons", [ _WidgetBase ], {
        // _TemplatedMixin will create our dom node using this HTML template.
    //    templateString: widgetTemplate,

        // DOM elements
        inputNodes: null,
        colorSelectNode: null,
        colorInputNode: null,
        infoTextNode: null,

        // Parameters configured in the Modeler.
        mfToExecute: "",
        messageString: "",
        backgroundColor: "",
        icon: "",
        width: "",
        height: "",
        animated: "",
        color: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function() {
            // Uncomment the following line to enable debug messages
            //logger.level(logger.DEBUG);
            logger.debug(this.id + ".constructor");
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            logger.debug(this.id + ".postCreate");

            var domNode = dojoConstruct.create("canvas", {
                class: this.icon,
                width: this.width,
                height: this.height
            })

            dojoConstruct.place(domNode, this.domNode, "only");
            this._createSkycon();
        },


        _createSkycon: function() {
            logger.debug(this.id + "._createSkycon start")
            //Create a list with all the possible values
        var    list  = [
            "clear_day", "clear_night", "partly_cloudy_day",
            "partly_cloudy_night", "cloudy", "rain", "sleet", "snow", "wind",
            "fog"
        ],
        i;
            if(this.coloring == "one"){
                var colorString = this.color;
                var skycons = new Skycons({"color": colorString});
            } else {
            logger.debug(this.id + "._createSkycon colored")
                // Colored instance of Skycon
                var skycons = new Skycons({"monochrome": false});
            }
            for(i = list.length; i--; ) {
                var weatherType = list[i],
                    elements = document.getElementsByClassName( weatherType );
                for (e = elements.length; e--;){
                    skycons.set( elements[e], weatherType );
                }
            }

            if(this.animated == true){
                skycons.play();
            }


        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
        //    this._resetSubscriptions();

            callback();
        },

    // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function(e) {
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },


    });
});

require(["Skycons/widget/Skycons"], function() {
    "use strict";
});
