//  /\_/|
// { ' ' } JellyCAT
//  \____\

function checkLogin() {
    if (atv.localStorage['jellyfin_loggedin'] === '1') {
        renderSearchScreen();
    } else {
        console.log("No authenticated user.");
        renderLoginRequestScreen();
    }
}

function renderSearchScreen() {
    xmlstr = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<atv>' +
        '  <head>' +
        '        <script src="http://jcathost.dns/js/jcm.js"/>' +
        '        <script src="http://jcathost.dns/js/searchfuncs.js"/>' +
        '  </head>' +
        '  <body>' +
        '    <search id="com.jellycat.search">' +
        '      <header>' +
        '        <simpleHeader accessibilityLabel="Search">' +
        '          <title>Search</title>' +
        '        </simpleHeader>' +
        '      </header>' +
        '      <baseURL></baseURL>' +
        '    </search>' +
        '  </body>' +
        '</atv>';
    xmlDoc = atv.parseXML(xmlstr);
    atv.loadAndSwapXML(xmlDoc);
}

function renderLoginRequestScreen() {
    xmlstr = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<atv>' +
        '  <head>' +
        '        <script src="http://jcathost.dns/js/jcm.js"/>' +
        '        <script src="http://jcathost.dns/js/search.js"/>' +
        '  </head>' +
        '  <body>' +
        '    <dialog id="com.jellycat.pleaselogin-dialog">' +
        '      <title>Not Connected</title>' +
        '      <description>Please go to the settings tab and add a Jellyfin Server.</description>' +
        '    </dialog>' +
        '  </body>' +
        '</atv>';
    xmlDoc = atv.parseXML(xmlstr);
    atv.loadAndSwapXML(xmlDoc);
}
