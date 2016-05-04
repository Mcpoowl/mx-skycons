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
  "dojo/_base/lang",
  "dojo/dom-class",

  "Skycons/lib/skycons",
  "Skycons/lib/jquery-1.11.2"
], function (declare, _WidgetBase, dom, dojoDom, dojoQuery, dojoClass, dojoStyle, dojoConstruct, dojoText, dojoHtml,dojoLang, domClass, Skycons, _jQuery) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget"s prototype.
    return declare("Skycons.widget.Skycons", [ _WidgetBase ], {

        // Parameters configured in the Modeler.
        icon: "",
        width: "",
        height: "",
        animated: "",
        color: "",
        useForecast:"",
        API:"",
        lat:"",
        long:"",
        extraDays:"",

        // Internal variables
        _skyNode: null,
        _contextObj: null,
        _latitude: null,
        _longitude: null,
        _skycons: null,

        update: function (obj, callback) {
          //Uncomment the line below to start debug logging.
          //logger.level(logger.DEBUG)
          logger.debug(this.id + ".update");
          this._contextObj = obj;
          if (this._skyNode === null) {
            // callback is called when the widget is ready (the domNode is created)
            this._createSkycon(callback);
          } else {
            callback();
          }
        },


        _createSkycon: function (callback) {
            logger.debug(this.id + "._createSkycon create domNode");



            if (this.useForecast) {
              this._getLat(false);
              this._getLong(true);

              logger.debug("ICON IN CREATE: " + this.icon);

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


              //Change the class attribute of the skyNode
             // domAttr.set(this._skyNode, "class", this.icon);   

              //TODO: Call forecast API and set icon to new icon based on forecast
              //this.icon =  this._getForecast(URL);
            } else {

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

            }

            this._skycons = new Skycons(skyconsOptions);
            this._skycons.add(this._skyNode, this.icon);

            if (this.animated === true) {
                this._skycons.play();
            }

            if (typeof callback === "function") {
              callback();
            }


        },

        // _renderSkycon: function(options, icon) {
        //     var skycons = new Skycons(options);
        //     skycons.add(this._skyNode, icon);

        //     if (this.animated === true) {
        //         skycons.play();
        //     }

        //     if (typeof callback === "function") {
        //       callback();
        //     }
        // },

        _getDate: function (extraDays) {
          var date = new Date();
          var dd = date.getDate()+ extraDays;
          var mm = date.getMonth()+1; //January is 0!
          var yyyy = date.getFullYear();

          if(dd<10) {
              dd='0'+dd
          } 

          if(mm<10) {
              mm='0'+mm
          } 

          var formattedDate = yyyy+'-'+mm+'-'+dd+'T12:00:00';
          return formattedDate;
        },

         _getLat: function(callback, isLong) {
            mx.data.action({
                  params       : {
                      actionname : this.lat,
                      applyto     : "selection",
                      guids       : [this._contextObj.getGuid()]
                  },
                  store: {
                      caller: this.mxform
                  },
                  callback     : dojoLang.hitch(this, this._callAPI, "false"),
                  error        : dojoLang.hitch(this, function(error) {
                      alert(error.description);
                      mendix.lang.nullExec(callback);
                  }),
                  onValidation : dojoLang.hitch(this, function(validations) {
                      alert("There were " + validations.length + " validation errors");
                      mendix.lang.nullExec(callback);
                  })
              });
          },

        _getLong: function(callback, isLong) {
          mx.data.action({
                params       : {
                    actionname : this.long,
                    applyto     : "selection",
                    guids       : [this._contextObj.getGuid()]
                },
                store: {
                    caller: this.mxform
                },
                callback     : dojoLang.hitch(this, this._callAPI, "true"),
                error        : dojoLang.hitch(this, function(error) {
                    alert(error.description);
                    mendix.lang.nullExec(callback);
                }),
                onValidation : dojoLang.hitch(this, function(validations) {
                    alert("There were " + validations.length + " validation errors");
                    mendix.lang.nullExec(callback);
                })
            });


        },


        _callAPI: function (someArg, returnedString){

          if(someArg == "true"){
            this._longitude = returnedString;
            logger.debug(this.id + " longitude in API: " + this._longitude + " ReturnedString: " + returnedString);
          } else {
            this._latitude = returnedString;
            logger.debug(this.id + " latitude in API: " + this._latitude + " ReturnedString: " + returnedString);
          }

          if (this._longitude != null && this._latitude != null)
          {

          var APIKey = this.API;
          logger.debug(this.id + " latitude: " + this._latitude);
          var extraDays = this.extraDays;
          var URL = "https://api.forecast.io/forecast/" + APIKey + "/" +this._latitude+","+this._longitude+","+this._getDate(extraDays);
          var data;
          //We need some helpers...
          var node = this._skyNode;
          var skyconHelp = this._skycons;

           $.getJSON(URL + "?callback=?", function(data) {
              logger.debug("URL Called:" + URL);
              logger.debug(data);
                //Math.round( number * 10 ) / 10
                //Set icon from JSON response
                logger.debug(data.currently.icon)
                domClass.replace(node, data.currently.icon);
                skyconHelp.set(node, data.currently.icon);
              });

          }
        }

    });
});

require(["Skycons/widget/Skycons"], function() {
    "use strict";
});