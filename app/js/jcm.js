//  /\_/|
// { ' ' } JellyCAT
//  \____\

fetchSettings(function() {
    overrideConsoleLog();
    console.log("Successfully retrieved settings & overwritten console log (JCM), sending logs to JCATHOST now.")
});

// ***************************************************
// JellyCAT Logger | Jclogger
// Function to override console.log, console.error, and console.warn and send logs to the JellyCAT stHack server

function overrideConsoleLog() {
    var originalConsoleLog = console.log;
    var originalConsoleError = console.error;
    var originalConsoleWarn = console.warn;

    console.log = function () {
        // Call the original console.log
        originalConsoleLog.apply(console, arguments);

        // Send the log to the server
        logToServer("LOG: " + JSON.stringify(arguments));
    };

    console.error = function () {
        // Call the original console.error
        originalConsoleError.apply(console, arguments);

        // Send the error to the server
        logToServer("ERROR: " + JSON.stringify(arguments));
    };

    console.warn = function () {
        // Call the original console.warn
        originalConsoleWarn.apply(console, arguments);

        // Send the warning to the server
        logToServer("WARNING: " + JSON.stringify(arguments));
    };
}

// Function to log console information to the server
// This however opens up a POI for attackers, so only leave this exposed in a dev environment. #todo: add in RM.MD
function logToServer(logData) {
    var logEndpoint = "https://" + atv.jcathost.SigHost + "/log";

    var logRequest = new XMLHttpRequest();
    logRequest.open("POST", logEndpoint, true);
    logRequest.setRequestHeader("Content-Type", "application/json");

    var logPayload = {
        timestamp: new Date().toISOString(),
        logData: logData
    };

    logRequest.send(JSON.stringify(logPayload));
}

// ***************************************************
// JellyCAT Host fetcher
// Function to fetch information we need from the host server
// fetch JSON from the HTTP URL using XMLHttpRequest

function fetchSettings(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://jcathost.dns/atvcsettings', true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);

                    // Store all properties in atv.jcathost
                    atv.jcathost = {
                        SigHost: data.sig_host,
                        SigHostPort: data.sig_host_p,
                        HostIP: data.host_ip,
                        System: data.system,
                        Version: data.version,
                        HelloMessage: data.hello,
                        // Add other properties as needed
                    };

                    // Execute the callback after setting atv.jcathost
                    callback();
                } catch (jsonError) {
                    console.error('Error parsing JSON:', jsonError);
                }
            } else {
                console.error('Error fetching settings. Status:', xhr.status);
            }
        }
    };

    xhr.send();
}

// ***************************************************
// ATVUtils - a JavaScript helper library for Apple TV
// Copied & Edited in full from:
// https://kortv.com/appletv/js/application.js
// https://github.com/wahlmanj/sample-aTV/blob/master/js/application.js

var atvutils = ATVUtils = {
    makeRequest: function(url, method, headers, body, callback) {
        if ( !url ) {
            throw "loadURL requires a url argument";
        }

        var method = method || "GET",
            headers = headers || {},
            body = body || "";

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            try {
                if (xhr.readyState == 4 ) {
                    if ( xhr.status == 200) {
                        callback(xhr.responseXML);
                    } else {
                        console.log("makeRequest received HTTP status " + xhr.status + " for " + url);
                        callback(null);
                    }
                }
            } catch (e) {
                console.error('makeRequest caught exception while processing request for ' + url + '. Aborting. Exception: ' + e);
                xhr.abort();
                callback(null);
            }
        }
        xhr.open(method, url, true);

        for(var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }

        xhr.send();
        return xhr;
    },

    makeErrorDocument: function(message, description) {
        if ( !message ) {
            message = "";
        }
        if ( !description ) {
            description = "";
        }

        var errorXML = '<?xml version="1.0" encoding="UTF-8"?> \
		<atv> \
		<body> \
		<dialog id="com.sample.error-dialog"> \
		<title><![CDATA[' + message + ']]></title> \
		<description><![CDATA[' + description + ']]></description> \
		</dialog> \
		</body> \
		</atv>';

        return atv.parseXML(errorXML);
    },

    siteUnavailableError: function() {
        // TODO: localize
        return this.makeErrorDocument("JellyCAT is currently unavailable. Try again later.", "Check JCHOST for log information.");
    },

    loadError: function(message, description) {
        atv.loadXML(this.makeErrorDocument(message, description));
    },

    loadAndSwapError: function(message, description) {
        atv.loadAndSwapXML(this.makeErrorDocument(message, description));
    },

    loadURLInternal: function(url, method, headers, body, loader) {
        var me = this,
            xhr,
            proxy = new atv.ProxyDocument;

        proxy.show();

        proxy.onCancel = function() {
            if ( xhr ) {
                xhr.abort();
            }
        };

        xhr = me.makeRequest(url, method, headers, body, function(xml) {
            try {
                loader(proxy, xml);
            } catch(e) {
                console.error("Caught exception in for " + url + ". " + e);
                loader(me.siteUnavailableError());
            }
        });
    },

    loadURL: function( options ) { //url, method, headers, body, processXML) {
        var me = this;
        if( typeof( options ) === "string" ) {
            var url = options;
        } else {
            var url = options.url,
                method = options.method || null,
                headers = options.headers || null,
                body = options.body || null,
                processXML = options.processXML || null;
        }

        this.loadURLInternal(url, method, headers, body, function(proxy, xml) {
            if(typeof(processXML) == "function") processXML.call(this, xml);
            try {
                proxy.loadXML(xml, function(success) {
                    if ( !success ) {
                        console.log("loadURL failed to load " + url);
                        proxy.loadXML(me.siteUnavailableError());
                    }
                });
            } catch (e) {
                console.log("loadURL caught exception while loading " + url + ". " + e);
                proxy.loadXML(me.siteUnavailableError());
            }
        });
    },

    // loadAndSwapURL can only be called from page-level JavaScript of the page that wants to be swapped out.
    loadAndSwapURL: function( options ) { //url, method, headers, body, processXML) {
        var me = this;
        if( typeof( options ) === "string" ) {
            var url = options;
        } else {
            var url = options.url,
                method = options.method || null,
                headers = options.headers || null,
                body = options.body || null,
                processXML = options.processXML || null;
        }

        this.loadURLInternal(url, method, headers, body, function(proxy, xml) {
            if(typeof(processXML) == "function") processXML.call(this, xml);
            try {
                proxy.loadXML(xml, function(success) {
                    if ( success ) {
                        atv.unloadPage();
                    } else {
                        console.log("loadAndSwapURL failed to load " + url);
                        proxy.loadXML(me.siteUnavailableError(), function(success) {
                            if ( success ) {
                                atv.unloadPage();
                            }
                        });
                    }
                });
            } catch (e) {
                console.error("loadAndSwapURL caught exception while loading " + url + ". " + e);
                proxy.loadXML(me.siteUnavailableError(), function(success) {
                    if ( success ) {
                        atv.unloadPage();
                    }
                });
            }
        });
    },

    /**
     * Used to manage setting and retrieving data from local storage
     */
    data: function(key, value) {
        if(key && value) {
            try {
                atv.localStorage.setItem(key, value);
                return value;
            } catch(error) {
                console.error('Failed to store data element: '+ error);
            }

        } else if(key) {
            try {
                return atv.localStorage.getItem(key);
            } catch(error) {
                console.error('Failed to retrieve data element: '+ error);
            }
        }
        return null;
    },

    deleteData: function(key) {
        try {
            atv.localStorage.removeItem(key);
        } catch(error) {
            console.error('Failed to remove data element: '+ error);
        }
    },


    /**
     * @params options.name - string node name
     * @params options.text - string textContent
     * @params options.attrs - array of attribute to set {"name": string, "value": string, bool}
     * @params options.children = array of childNodes same values as options
     * @params doc - document to attach the node to
     * returns node
     */
    createNode: function(options, doc) {
        var doc = doc || document;
        options = options || {};

        if(options.name && options.name != '') {
            var newElement = doc.makeElementNamed(options.name);

            if(options.text) newElement.textContent = options.text;

            if(options.attrs) {
                options.attrs.forEach(function(e, i, a) {
                    newElement.setAttribute(e.name, e.value);
                }, this);
            }

            if(options.children) {
                options.children.forEach(function(e,i,a) {
                    newElement.appendChild( this.createNode( e, doc ) );
                }, this)
            }

            return newElement;
        }
    },

    validEmailAddress: function( email ) {
        var emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
            isValid = email.search( emailRegex );
        return ( isValid > -1 );
    },

    softwareVersionIsAtLeast: function( version ) {
        var deviceVersion = atv.device.softwareVersion.split('.'),
            requestedVersion = version.split('.');

        // We need to pad the device version length with "0" to account for 5.0 vs 5.0.1
        if( deviceVersion.length < requestedVersion.length ) {
            var difference = requestedVersion.length - deviceVersion.length,
                dvl = deviceVersion.length;

            for( var i = 0; i < difference; i++ ) {
                deviceVersion[dvl + i] =  "0";
            };
        };

        // compare the same index from each array.
        for( var c = 0; c < deviceVersion.length; c++ ) {
            var dv = deviceVersion[c],
                rv = requestedVersion[c] || "0";

            if( parseInt( dv ) > parseInt( rv ) ) {
                return true;
            } else if( parseInt( dv ) < parseInt( rv )  ) {
                return false;
            };
        };

        // If we make it this far the two arrays are identical, so we're true
        return true;
    },

    shuffleArray: function( arr ) {
        var tmp, current, top = arr.length;

        if(top) {
            while(--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = arr[current];
                arr[current] = arr[top];
                arr[top] = tmp;
            };
        };

        return arr;
    },

    loadTextEntry: function( textEntryOptions ) {
        var textView = new atv.TextEntry;

        textView.type              = textEntryOptions.type             || "emailAddress";
        textView.title             = textEntryOptions.title            || "";
        textView.image             = textEntryOptions.image            || null;
        textView.instructions      = textEntryOptions.instructions     || "";
        textView.label             = textEntryOptions.label            || "";
        textView.footnote          = textEntryOptions.footnote         || "";
        textView.defaultValue      = textEntryOptions.defaultValue     || null;
        textView.defaultToAppleID  = textEntryOptions.defaultToAppleID || false;
        textView.onSubmit          = textEntryOptions.onSubmit,
            textView.onCancel          = textEntryOptions.onCancel,

            textView.show();
    },

    log: function ( message , level ) {
        var debugLevel = atv.sessionStorage.getItem( "DEBUG_LEVEL" ),
            level = level || 0;

        if( level <= debugLevel ) {
            console.log( message );
        }
    },

    accessibilitySafeString: function ( string ) {
        var string = unescape( string );

        string = string
            .replace( /&amp;/g, 'and' )
            .replace( /&/g, 'and' )
            .replace( /&lt;/g, 'less than' )
            .replace( /\</g, 'less than' )
            .replace( /&gt;/g, 'greater than' )
            .replace( /\>/g, 'greater than' );

        return string;
    }
};

// Extend atv.ProxyDocument to load errors from a message and description.
if( atv.ProxyDocument ) {
    atv.ProxyDocument.prototype.loadError = function(message, description) {
        var doc = atvutils.makeErrorDocument(message, description);
        this.loadXML(doc);
    }
}


// atv.Document extensions
if( atv.Document ) {
    atv.Document.prototype.getElementById = function(id) {
        var elements = this.evaluateXPath("//*[@id='" + id + "']", this);
        if ( elements && elements.length > 0 ) {
            return elements[0];
        }
        return undefined;
    }
}


// atv.Element extensions
if( atv.Element ) {
    atv.Element.prototype.getElementsByTagName = function(tagName) {
        return this.ownerDocument.evaluateXPath("descendant::" + tagName, this);
    }

    atv.Element.prototype.getElementByTagName = function(tagName) {
        var elements = this.getElementsByTagName(tagName);
        if ( elements && elements.length > 0 ) {
            return elements[0];
        }
        return undefined;
    }
}

// Simple Array Sorting methods
Array.prototype.sortAsc = function() {
    this.sort(function( a, b ){
        return a - b;
    });
};

Array.prototype.sortDesc = function() {
    this.sort(function( a, b ){
        return b - a;
    });
};


// Date methods and properties
Date.lproj = {
    "DAYS": {
        "en": {
            "full": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            "abbrv": ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        },
        "en_GB": {
            "full": ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            "abbrv": ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        }
    },
    "MONTHS": {
        "en": {
            "full": ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            "abbrv": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        "en_GB": {
            "full": ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            "abbrv": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    }
}

Date.prototype.getLocaleMonthName = function( type ) {
    var language = atv.device.language,
        type = ( type === true ) ? "abbrv" : "full",
        MONTHS = Date.lproj.MONTHS[ language ] || Date.lproj.MONTHS[ "en" ];

    return MONTHS[ type ][ this.getMonth() ];
};

Date.prototype.getLocaleDayName = function( type ) {
    var language = atv.device.language,
        type = ( type === true ) ? "abbrv" : "full",
        DAYS = Date.lproj.DAYS[ language ] || Date.lproj.DAYS[ "en" ];

    return DAYS[ type ][ this.getDay() ];
};

Date.prototype.nextDay = function( days ) {
    var oneDay = 86400000,
        days = days || 1;
    this.setTime( new Date( this.valueOf() + ( oneDay * days ) ) );
};

Date.prototype.prevDay = function( days ) {
    var oneDay = 86400000,
        days = days || 1;
    this.setTime( new Date( this.valueOf() - ( oneDay * days ) ) );
};


// String Trim methods
String.prototype.trim = function ( ch )
{
    var ch = ch || '\\s',
        s = new RegExp( '^['+ch+']+|['+ch+']+$','g');
    return this.replace(s,'');
};

String.prototype.trimLeft = function ( ch )
{
    var ch = ch || '\\s',
        s = new RegExp( '^['+ch+']+','g');
    return this.replace(s,'');
};

String.prototype.trimRight = function ( ch )
{
    var ch = ch || '\\s',
        s = new RegExp( '['+ch+']+$','g');
    return this.replace(s,'');
};

String.prototype.xmlEncode = function()
{
    var string = unescape( this );

    string = string
        .replace( /&/g, '&amp;' )
        .replace( /\</g, '&lt;' )
        .replace( /\>/g, '&gt;' );

    return string;
};

/**
 * This is an XHR handler. It handles most of tediousness of the XHR request
 * and keeps track of onRefresh XHR calls so that we don't end up with multiple
 * page refresh calls.
 *
 * You can see how I call it on the handleRefresh function below.
 *
 *
 * @params object (hash) $options
 * @params string $options.url - url to be loaded
 * @params string $options.method - "GET", "POST", "PUT", "DELTE"
 * @params bool $options.type - false = "Sync" or true = "Async" (You should always use true)
 * @params func $options.success - Gets called on readyState 4 & status 200
 * @params func $options.failure - Gets called on readyState 4 & status != 200
 * @params func $options.callback - Gets called after the success and failure on readyState 4
 * @params string $options.data - data to be sent to the server
 * @params bool $options.refresh - Is this a call from the onRefresh event.
 */
ATVUtils.Ajax = function($options) {
    var me = this;
    $options = $options || {}

    /* Setup properties */
    this.url = $options.url || false;
    this.method = $options.method || "GET";
    this.type = ($options.type === false) ? false : true;
    this.success = $options.success || null;
    this.failure = $options.failure || null;
    this.data = $options.data || null;
    this.complete = $options.complete || null;
    this.refresh = $options.refresh || false;

    if(!this.url) {
        console.error('\nAjax Object requires a url to be passed in: e.g. { "url": "some string" }\n')
        return undefined;
    };

    this.id = Date.now();

    this.createRequest();

    this.req.onreadystatechange = this.stateChange;

    this.req.object = this;

    this.open();

    this.send();

};

ATVUtils.Ajax.currentlyRefreshing = false;
ATVUtils.Ajax.activeRequests = {};

ATVUtils.Ajax.prototype = {
    stateChange: function() {
        var me = this.object;
        switch(this.readyState) {
            case 1:
                if(typeof(me.connection) === "function") me.connection(this, me);
                break;
            case 2:
                if(typeof(me.received) === "function") me.received(this, me);
                break;
            case 3:
                if(typeof(me.processing) === "function") me.processing(this, me);
                break;
            case 4:
                if(this.status == "200") {
                    if(typeof(me.success) === "function") me.success(this, me);
                } else {
                    if(typeof(me.failure) === "function") me.failure(this.status, this, me);
                }
                if(typeof(me.complete) === "function") me.complete(this, me);
                if(me.refresh) Ajax.currentlyRefreshing = false;
                break;
            default:
                console.log("I don't think I should be here.");
                break;
        }
    },
    cancelRequest: function() {
        this.req.abort();
        delete ATVUtils.Ajax.activeRequests[ this.id ];
    },
    cancelAllActiveRequests: function() {
        for ( var p in ATVUtils.Ajax.activeRequests ) {
            if( ATVUtils.Ajax.activeRequests.hasOwnProperty( p ) ) {
                var obj = ATVUtils.Ajax.activeRequests[ p ];
                if( ATVUtils.Ajax.prototype.isPrototypeOf( obj ) ) {
                    obj.req.abort();
                };
            };
        };
        ATVUtils.Ajax.activeRequests = {};
    },
    createRequest: function() {
        try {
            this.req = new XMLHttpRequest();
            ATVUtils.Ajax.activeRequests[ this.id ] = this;
            if(this.refresh) ATVUtils.Ajax.currentlyRefreshing = true;
        } catch (error) {
            alert("The request could not be created: </br>" + error);
            console.error("failed to create request: " +error);
        }
    },
    open: function() {
        try {
            this.req.open(this.method, this.url, this.type);
        } catch(error) {
            console.log("failed to open request: " + error);
        }
    },
    send: function() {
        var data = this.data || null;
        try {
            this.req.send(data);
        } catch(error) {
            console.log("failed to send request: " + error);
        }
    }
};

function handleNavbarNavigate( event ) {
    console.log( "Handling the navigation event."+ JSON.stringify( event ) );

    // The navigation item ID is passed in through the event parameter.
    var navId = event.navigationItemId,

        // Use the event.navigationItemId to retrieve the appropriate URL information this can
        // retrieved from the document navigation item.
        docUrl = document.getElementById( navId ).getElementByTagName( 'url' ).textContent,

        // Request the XML document via URL and send any headers you need to here.
        ajax = new ATVUtils.Ajax({
            "url": docUrl,
            "success": function( xhr ){
                console.log( "successfully loaded the XHR" );

                // After successfully retrieving the document you can manipulate the document
                // before sending it to the navigation bar.
                var doc = xhr.responseXML

                // Once the document is ready to load pass it to the event.success function
                event.success( doc );
            },
            "failure": function( status, xhr ){
                // If the document fails to load pass an error message to the event.failure button
                event.failure( "Navigation failed to load." );
            }
        });

    event.onCancel = function() {
        console.log("nav bar nagivation was cancelled");
        // declare an onCancel handler to handle cleanup if the user presses the menu button before the page loads.
    }

}

console.log('Reached EOF!');

