/**
 * jskeleton-Keychain
 *
 * Local/session storage manager for jskeleton projects.
 * ------------------------------------------------------------------------------------
 * - Based on @tymondesigns angular-locker https://github.com/tymondesigns/angular-locker.git
 *
 * @link
 * @author Jorge Serrano  @Enderlab
 * @license MIT License, http://www.opensource.org/licenses/MIT
 *
 */
(function(root, factory) {
    'use strict';
    /*globals require, define, module, Backbone, _ */
    /* jshint unused: false */

    if (typeof define === 'function' && define.amd) {
        define(['jskeleton'
        ], function(JSkeleton) {
            return factory.call(root, JSkeleton);
        });
    } else if (typeof module !== 'undefined' && module.exports) {

        var JSkeleton = require('jskeleton');

        module.exports = factory(root, JSkeleton);

    } else if (root !== undefined) {
        factory.call(root,root, root.JSkeleton);
    }

})(this, function(root, JSkeleton) {

    'use strict';

    /*globals _*/

    /* jshint unused: false */
    //  --------------------
    //  KEYCHAIN
    //  --------------------

    JSkeleton.Keychain = {};

    //Add to global scope
    function Keychain (){


        // Set the defaults
        this._defaultParams = {
            driver : 'local',
            namespace: 'Keychain',
            eventsEnabled:  true,
            separator: '.',
            extend: {}
        };

        this._options = _.extend(this._defaultParams, JSkeleton.common.get('Keychain'));


         // Attach events
        if (this._options.eventsEnabled){
            _.extend(this, Backbone.Events);
        }


        // If value is a function then execute, otherwise return
        this._value = function(value,param){
            return _.isFunction(value) ? value(param) : value;
        };


        // Determine whether a value is defined and not null
        this._defined = function(value){
            return _.isUndefined(value) !== true && value !== null;
        };


        // Trigger an error
        this._error = function(msg){
            throw new Error('[jskeleton-Keychain] ' + msg);
        };


        // Out of the box drivers
        this._registeredDrivers = _.extend({
            local : window.localStorage,
            session: window.sessionStorage,
            cookie : window.document.cookie
        },this._options.extend);


        // Get the Storage instance from the key
        this._resolveDriver = function (driver) {
            if(! this._registeredDrivers.hasOwnProperty(driver)){
                this._error('The driver "' + driver + '" was not found.');
            }

            return this._registeredDrivers[driver];
        };

        // The driver instance
        this._driver = this._resolveDriver(this._options.driver);


        // The namespace value
        this._namespace = this._options.namespace;


        // Separates the namespace from the keys
        this._separator = this._options.separator;


        // Store the watchers here so we can un-register them later
        this._watchers = {};


        // Check browser support
        this._checkSupport = function(driver){
            if (! this._defined(this._supported)) {
                var l = 'l';
                try {
                    this._resolveDriver(driver || 'local').setItem(l, l);
                    this._resolveDriver(driver || 'local').removeItem(l);
                    this._supported = true;

                } catch(e){
                    this._supported = false;
                }
            }

            return this._supported;
        };


        // Build the storage key from the namespace
        this._getPrefix = function(key){

            if (! this._namespace){
                return key;
            }

            return this._namespace + this._separator + key;
        };


        // Try to encode value as json, or just return the value upon failure
        this._serialize = function(value){

            try {
                return JSON.stringify(value);
            } catch(e){
                return value;
            }
        };


        // Try to parse value as json, if it fails then it probably isn't json so just return it
        this._unserialize = function(value){

            try {
                return JSON.parse(value);
            }catch(e){
                return value;
            }
        };


        // Trigger an event
        this._event = function(name,payload){
            if (this._options.eventsEnabled){

                this.trigger(name,_.extend(payload, {
                    driver : this._options.driver,
                    namespace : this._namespace
                }));
            }
        };


        // Add to storage
        // http://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage
        this._setItem = function(key,value){

            if (! this._checkSupport()){
                this._error('The browser does not support localStorage');
            }

            try {
                var oldVal = this._getItem(key);

                this._driver.setItem(this._getPrefix(key), this._serialize(value));

                if (this._exists(key) && ! _.isEqual(oldVal, value)) {
                    this._event(this._namespace+'.item.updated', { key: key, oldValue: oldVal, newValue: value });
                }else{
                    this._event(this._namespace+'.item.added', { key: key, value: value });
                }

            }catch(e){
                if (['QUOTA_EXCEEDED_ERR', 'NS_ERROR_DOM_QUOTA_REACHED', 'QuotaExceededError'].indexOf(e.name) !== -1) {
                    this._error('The browser storage quota has been exceeded');
                }else{
                    this._error('Could not add item with key "' + key + '"');
                }
            }
        };


        // Get from storage
        this._getItem = function (key) {

            if (! this._checkSupport()){
                this._error('The browser does not support localStorage');
            }

            return this._unserialize(this._driver.getItem(this._getPrefix(key)));
        };


        // Exists in storage
        this._exists = function(key){

            if(! this._checkSupport()){
                this._error('The browser does not support localStorage');
            }

            return this._driver.hasOwnProperty(this._getPrefix(this._value(key)));
        };


        // Remove form storage
        this._removeItem = function(key){

            if (! this._checkSupport()){
                this._error('The browser does not support localStorage');
            }

            if(! this._exists(key)){
                return false;
            }

            this._driver.removeItem(this._getPrefix(key));
            this._event(this._namespace+'.item.forgotten', { key: key });

            return true;

        };
    }

    /**
    *
    * Define the public api
    *
    **/
    Keychain.prototype = {

        //Add a new item to storage (even if it already exists)
        put: function (key, value, def) {
            if (! this._defined(key)){
                return false;
            }
            key = this._value(key);

            if (_.isObject(key)) {
                _.each(key, function (value, key) {
                    this._setItem(key, this._defined(value) ? value : def);
                }, this);
            } else {
                if (! this._defined(value)){
                    return false;
                }

                var val = this._getItem(key);
                this._setItem(key, this._value(value, this._defined(val) ? val : def));
            }

            return this;
        },


        // Add an item to storage if it doesn't already exist
        add: function (key, value, def) {
            if (! this.has(key)) {
                this.put(key, value, def);
                return true;
            }

            return false;
        },


        // Retrieve the specified item from storage
        get: function (key, def) {
            if (_.isArray(key)) {
                var items = {};
                _.each(key, function (k) {
                    if (this.has(k)) {
                        items[k] = this._getItem(k);
                    }
                }, this);

                return items;
            }

            if (! this.has(key)) {
                return arguments.length === 2 ? def : void 0;
            }

            return this._getItem(key);
        },


        // Determine whether the item exists in storage
        has: function (key) {
            return this._exists(key);
        },


        // Remove specified item(s) from storage
        forget: function (key) {
            key = this._value(key);

            if (_.isArray(key)) {
                key.map(this._removeItem, this);
            } else {
                this._removeItem(key);
            }

            return this;
        },


        // Retrieve the specified item from storage and then remove it
        pull: function (key, def) {
            var value = this.get(key, def);
            this.forget(key);

            return value;
        },


        // Return all items in storage within the current namespace/driver
        all: function () {
            var items = {};
            var key;
            for ( var i = 0, len = this._driver.length; i < len; ++i ) {

              if (this._namespace) {
                    var prefix = this._namespace + this._separator;
                    if (this._driver.key( i ).indexOf(prefix) === 0){
                        key = this._driver.key( i ).substring(prefix.length);
                    }
                }
                if (this.has(key)){
                    items[key] = this.get(key);
                }
            }


            return items;
        },


        // Get the storage keys as an array
        keys: function () {
            return Object.keys(this.all());
        },


        // Remove all items set within the current namespace/driver
        clean: function () {
            return this.forget(this.keys());
        },


        // Empty the current storage driver completely. careful now.
        empty: function () {
            this._driver.clear();

            return this;
        },


        // Get the total number of items within the current namespace
        count: function () {
            return this.keys().length;
        },

        // Set the storage driver on a new instance to enable overriding defaults
        driver: function (driver) {
            // no need to create a new instance if the driver is the same
            if (driver === this._options.driver){
                return this;
            }

            return this.instance(_.extend(this._options, { driver: driver }));
        },

        // Get the currently set driver
        getDriver: function () {
            return this._driver;
        },


        // Set the namespace on a new instance to enable overriding defaults
        namespace: function (namespace) {
            // no need to create a new instance if the namespace is the same
            if (namespace === this._namespace){
                return this;
            }

            return this.instance(_.extend(this._options, { namespace: namespace }));
        },

        // Get the currently set namespace
        getNamespace: function () {
            return this._namespace;
        },


        // Check browser support
        // @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js#L38-L47
        supported: function (driver) {
            return this._checkSupport(driver);
        },

        // Get a new instance of Keychain
        instance: function (options) {
            return new Keychain(options);
        }
    };


    //Add Keychain as JSkeleton.Extension to use like dependency inside apps
    JSkeleton.extension.add('Keychain',{ factory: true , extensionClass: Keychain });


    return JSkeleton.Keychain;

});
