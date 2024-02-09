//  /\_/|
// { ' ' } JellyCAT
//  \____\

//----------------------------DOMView--------------------------------------------

var JCATHOSTInfoXML = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<atv>\n' +
    '    <head>\n' +
    '    </head>\n' +
    '    <body>\n' +
    '        <scrollingText id="com.jellycat.jcathostinfo" initialSelection="1">\n' +
    '            <title>JCATHOST Information</title>\n' +
    '            <text><![CDATA[\n' +
    '//  /\\_/ |\n' +
    '// { \'  \'  }   JellyCAT\n' +
    '//  \\____\\\n' +
    '\n' +
    'ENGLISH\n' +
    '\n' +
    '-=JellyCAT Server (JCHOST) Information=-\n' +
    '\n' +
    'JellyCAT Server Host (fallback):\n' +
    'http://jcathost.dns\n' +
    '\n' +
    'ATVCSETTINGS pick-up location:\n' +
    'http://jcathost.dns/atvcsettings\n' +
    '\n' +
    'ATVCSETTINGS Hello:\n' +
    '$atvcsettings.hello\n' +
    '\n' +
    'ATVCSETTINGS System Information:\n' +
    '$atvcsettings.system\n' +
    '\n' +
    'JellyCat Version:\n' +
    '$atvcsettings.version\n' +
    '\n' +
    'Hijacked Host App domain\n' +
    '$atvcsettings.sighost\n' +
    '\n' +
    'JellyCAT Server Host IP\n' +
    '$atvcsettings.hostip\n' +
    ']]></text>\n' +
    '            <buttons>\n' +
    '                <actionButton onSelect="atvutils.loadURL(\'https://\'+ atv.jcathost.SigHost +\'/xml/about.xml\');" id="help">\n' +
    '                    <title>About</title>\n' +
    '                </actionButton>\n' +
    '                <actionButton onSelect="DomViewManager.unloadView(\'JcathostInfoView\');" id="close">\n' +
    '                    <title>Close</title>\n' +
    '                </actionButton>\n' +
    '            </buttons>\n' +
    '        </scrollingText>\n' +
    '    </body>\n' +
    '</atv>';

JCATHOSTInfoXML = JCATHOSTInfoXML
    .replace(/\$atvcsettings\.hello/g, atv.jcathost.HelloMessage)
    .replace(/\$atvcsettings\.system/g, atv.jcathost.System)
    .replace(/\$atvcsettings\.version/g, atv.jcathost.Version)
    .replace(/\$atvcsettings\.sighost/g, atv.jcathost.SigHost)
    .replace(/\$atvcsettings\.hostip/g, atv.jcathost.HostIP);


function generateJCATHOSTInfoXML() {
    var doc = atv.parseXML( JCATHOSTInfoXML );

    console.log( "Creating the view --> " );
    DomViewManager.createView( "JcathostInfoView" );

    console.log( "Loading the view --> " );
    DomViewManager.loadView( "JcathostInfoView", doc );

    console.log( "View is loaded" );
}

// ***************************************************
// DOMView | Wrapper
// https://github.com/wahlmanj/sample-aTV/blob/dba73806c21183fb35d6edca94b960691d8e5d66/js/views/DOMView/DOMView.js

/**
 * This wrapper makes it easier to handle the DOM View JS calls.
 * The actual calls for DOMView are:
 * view = new atv.DOMView()
 * view.onUnload - similar to onPageUnload
 * view.load ( XMLDOC, function(sucess) { ... } ) - pushes the view onto the stack the callback function is called back and gives you a success or fail call.
 * view.unload - removes the view from the stack.
 */
var DomViewManager = ( function() {
    var views = {},
        ViewNames = [],
        config = {},
        callbackEvents = {},
        optionDialogXML = {};


    function _saveView( name, view ) {
        if( name && view ) {
            views[ name ] = view;
            _addViewToList( name );

        } else {
            console.error( "When saving a view, both name and view are required" );
        };
    };

    function _deleteView( name ) {
        if( views[ name ] ) {
            delete views[ name ];
            _removeViewFromList( name );
        };
    };

    function _retrieveView( name ) {
        if( name ) {
            return views[ name ] || null;
        } else {
            console.error( "When attempting to retrieve a view name is required.");
        };
        return null;
    };

    function _addViewToList( name ) {
        var index = ViewNames.indexOf( name );
        if( index == -1 ) {
            ViewNames.push( name );
        };
    };

    function _removeViewFromList( name ) {
        var index = ViewNames.indexOf( name );
        if( index > -1 ) {
            ViewNames.splice( index, 1 );
        };
    };

    function _createDialogXML( dialogOptions ) {
        var doc = atv.parseXML( optionDialogXML ),
            title = dialogOptions.title,
            description = dialogOptions.description,
            initialSelection = dialogOptions.initialSelection || 0,
            options = dialogOptions.options || [];


        // fill in the title, accessibility label
        doc.rootElement.getElementByTagName( 'title' ).textContent = title;
        doc.rootElement.getElementByTagName( 'simpleHeader' ).setAttribute( 'accessibilityLabel', title +". "+ description );

        // fill in the description
        doc.rootElement.getElementByTagName( 'description' ).textContent = description;

        // fill in the initial selection
        doc.rootElement.getElementByTagName( 'row' ).textContent = initialSelection;

        // fill in the options
        var items = doc.rootElement.getElementByTagName( 'items' );
        options.forEach( function ( option, index ) {
            // save option callbacks
            RegisterCallbackEvent( "DialogOption_"+index, option.callback );

            // create the option
            var newOptionButton = ATVUtils.createNode({
                    "name": "oneLineMenuItem",
                    "attrs": [{
                        "name": "id",
                        "value": "DialogOption_"+ index
                    }, {
                        "name": "accessibilityLabel",
                        "value": option.label
                    }, {
                        "name": "onSelect",
                        "value": "DomViewManager.fireCallback( 'DialogOption_"+ index +"' );"
                    }],
                    "children": [{
                        "name": "label",
                        "text": option.label
                    }]
                },
                doc );

            // append it to the items.
            items.appendChild( newOptionButton );
        });

        return doc;

    }

    function ListSavedViews() {
        return ViewNames;
    };

    function setConfig(property, value) {
        console.log( " ===> Setting: "+ property +" = "+ value +" <=== " );
        config[ property ] = value;
    };

    function getConfig(property) {
        var value = config[property];
        return (value) ? value: null;
    };

    // Create a new DomView
    function CreateView( name, dialogOptions ) {
        if( name ) {
            var view = new atv.DOMView();

            _saveView( name, view );

            if( typeof( dialogOptions ) === "object" ) {
                var doc = _createDialogXML( dialogOptions );
            };

            setConfig( name+"_doc", doc )

            view.onUnload = function() {
                console.log(" == DOMView onUnload called == " );
                FireCallbackEvent("ONUNLOADVIEW", {
                    "name": name,
                    "view": this
                });
            };

        } else {
            console.error("When attempting to create a DOM view, name is required.");
        };
    };

    function RemoveView( name ) {
        // unload the view, remove the view from the view list, remove the view name
        UnloadView( name );
        _deleteView( name );
    };

    function LoadView( name, doc ) {
        try {
            var view = _retrieveView( name ),
                doc = doc || getConfig( name+"_doc" );

            if( !view )
            {
                CreateView( name );
                view = _retrieveView( name );
            }

            console.log( "We load the view: "+ name +" : "+ view );
            view.load(doc, function(success) {
                console.log("DOMView succeeded " + success);
                if( success )
                {
                    console.log("=== Saving Document: "+ name +"_doc ===");
                    view.doc = doc.serializeToString();
                    FireCallbackEvent( "ONLOADSUCCESS", { "view": name } )
                }
                else
                {
                    var msg = "Unable to load view."
                    FireCallbackEvent( "ONLOADERROR", { "id": "LOADERROR", "view":name, "msg": msg } );
                }
            });
        } catch ( error ) {
            console.error( "LOAD ERROR: "+ error );
        };
    };

    function UnloadView( name ) {
        var view = _retrieveView( name );
        view.unload();
    };

    function RegisterCallbackEvent( name, callback ) {
        console.log(" ---- Registering Callback: " + name + " with callback type: " + typeof(callback));
        if (typeof callback === "function") {
            callbackEvents[name] = callback;
        } else {
            console.error("When attempting to register a callback event, a callback function is required.");
        };
    };

    function FireCallbackEvent( name, parameters, scope ) {
        var scope = scope || this,
            parameters = parameters || {};

        if (callbackEvents[name] && typeof callbackEvents[name] === "function") {
            callbackEvents[name].call(scope, parameters)
        };
    };

    return {
        "createView": CreateView,
        "removeView": RemoveView,
        "loadView": LoadView,
        "unloadView": UnloadView,
        "listViews": ListSavedViews,
        "registerCallback": RegisterCallbackEvent,
        "fireCallback": FireCallbackEvent
    };

})();


// ------ End DOM View Manager --------

