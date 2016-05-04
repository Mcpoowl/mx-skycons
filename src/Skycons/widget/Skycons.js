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
  "dijit/_TemplatedMixin",
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
  "dojo/dom-attr",

  "Skycons/lib/skycons",
  "Skycons/lib/jquery-1.11.2",
  "dojo/text!Skycons/widget/template/Skycons.html"
], function (_TemplatedMixin, declare, _WidgetBase, dom, dojoDom, dojoQuery, dojoClass, dojoStyle, dojoConstruct, dojoText, dojoHtml, dojoLang, domClass, domAttr, Skycons, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget"s prototype.
    return declare("Skycons.widget.Skycons", [ _WidgetBase,  _TemplatedMixin], {
        templateString: widgetTemplate,
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
        showTemp:"",
        temperatureScale:"",

        //DOM elements
        _skyNode: null,
        infoNode: null,

        // Internal variables

        _contextObj: null,
        _latitude: null,
        _longitude: null,
        _skycons: null,



        update: function (obj, callback) {
          //Uncomment the line below to start debug logging.
          //logger.level(logger.DEBUG);
          logger.debug(this.id + ".update");
          this._contextObj = obj;
          //if (this._skyNode === null) {
            // callback is called when the widget is ready (the domNode is created)
            this._createSkycon(callback);
         // } else {
         //   callback();
         // }
        },

        _createSkycon: function (callback) {
            logger.debug(this.id + "._createSkycon create domNode");

              domAttr.set(this._skyNode, "class", this.icon)
              domAttr.set(this._skyNode, "width", this.width)
              domAttr.set(this._skyNode, "height", this.height)

            if (this.useForecast) {
              this._getLat(false);
              this._getLong(true);

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

            } else {

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


        _callAPI: function (longBool, returnedString){

          if(longBool == "true"){
            this._longitude = returnedString;
            logger.debug(this.id + " longitude in API: " + this._longitude + " ReturnedString: " + returnedString);
          } else {
            this._latitude = returnedString;
            logger.debug(this.id + " latitude in API: " + this._latitude + " ReturnedString: " + returnedString);
          }

          if (this._longitude != null && this._latitude != null)
          {
            //Dirty check to see if the API key was not empty
            if(this.API.length > 0) {

              logger.debug(this.id + " latitude: " + this._latitude);
              var extraDays = this.extraDays;
              var forecastDate = this._getDate(extraDays)
              var URL = "https://api.forecast.io/forecast/" + this.API + "/" +this._latitude+","+this._longitude+","+forecastDate;
              var data;
              //We need some helpers... for quick access..
              var node = this._skyNode;
              var skyconHelp = this._skycons;
              var tempBoolean = this.showTemp;
              var tempScale = this.temperatureScale;
              var info = this.infoNode;

               $.getJSON(URL + "?callback=?", function(data, status, xhr) {
                  logger.debug("URL Called:" + URL);
                  logger.debug(data);
                  //Try to set icon based on API call.. If succesfull
                    domClass.replace(node, data.currently.icon);
                    skyconHelp.set(node, data.currently.icon);

                    if(tempBoolean) {
                      if(tempScale === 'C') {
                        //Celcius   
                        var temp = data.currently.temperature;
                        var Celc =  (temp - 32) * (5 / 9);
                        domAttr.set(info, { innerHTML: Math.round(Celc) + "&deg; C"});
                      }
                      else if (tempScale === 'F') {
                        //Fahrenheit
                        domAttr.set(info, {innerHTML: Math.round(data.currently.temperature) + "&deg; F"});
                      } 
                    } else {
                        dojoConstruct.destroy(info);
                    }
                  });
            } else {
              logger.error("Invalid API key supplied!: " + this.API)
            }

          
          }
        }

    });
});

require(["Skycons/widget/Skycons"], function() {
    "use strict";
});