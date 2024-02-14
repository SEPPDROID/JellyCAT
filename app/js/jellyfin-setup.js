//  /\_/|
// { ' ' } JellyCAT
//  \____\

// Function to show text entry page
showTextEntryPage = function(input_type, input_title, input_instructions, callback_submit, callback_cancel, defaultvalue) {
    var textEntry = new atv.TextEntry();

    textEntry.type = input_type;
    textEntry.title = input_title;
    textEntry.instructions = input_instructions;
    textEntry.defaultValue = defaultvalue;
    textEntry.defaultToAppleID = false;
    // textEntry.image =
    textEntry.onSubmit = callback_submit;
    textEntry.onCancel = callback_cancel;

    textEntry.show();
};

// Function to set server address
function setServerAddress() {
    showTextEntryPage(
        "emailAddress",
        "Set Jellyfin Server Address",
        "Enter the address of the Jellyfin server: \n\nExample: \nhttps://demo.jellyfin.org/stable \nhttp://192.168.11.11:8096",
        function(value) {
            // Save server address to localStorage
            atv.localStorage['jellyfin_server_address'] = value;
            fetchDataAndRender();
        },
        function() {
            fetchDataAndRender();
        },
        atv.localStorage['jellyfin_server_address'] || "http://"
    );
}

// Function to set username
function setUsername() {
    showTextEntryPage(
        "emailAddress",
        "Set Jellyfin Username",
        "Enter your Jellyfin username:",
        function(value) {
            // Save username to localStorage
            atv.localStorage['jellyfin_username'] = value;
            fetchDataAndRender();
        },
        function() {
            fetchDataAndRender();
        },
        atv.localStorage['jellyfin_username'] || ""
    );
}

// Function to set password
function setPassword() {
    showTextEntryPage(
        "password",
        "Set Jellyfin Password",
        "Enter your Jellyfin password:",
        function(value) {
            // Save password to localStorage
            atv.localStorage['jellyfin_password'] = value;
            fetchDataAndRender();
        },
        function() {
            fetchDataAndRender();
        },
        atv.localStorage['jellyfin_password'] || ""

    );
}

// Let's try finding and changing the values
function fetchDataAndRender() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xmlstr = xhttp.responseText;
            var serverAddress = atv.localStorage['jellyfin_server_address'];
            var username = atv.localStorage['jellyfin_username'];
            var modifiedXml = xmlstr.replace(/\$server_address/g, serverAddress).replace(/\$username/g, username);
            var xmlDoc = atv.parseXML(modifiedXml);
            atv.loadAndSwapXML(xmlDoc);
        }
    };
    xhttp.open("GET", 'https://' + atv.jcathost.SigHost + '/xml/server-settings.xml', true);
    xhttp.send();
}

function getJellyfinInfo() {
    var xhttp = new XMLHttpRequest();
    var serverAddress = atv.localStorage['jellyfin_server_address'];

    if (!serverAddress) {
        showServerErrorScreen();
        return;
    }

    if (!serverAddress || !/(http|https):\/\//.test(serverAddress)) {
        showServerErrorScreen();
        return;
    }

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var response = JSON.parse(this.responseText);
                if (response && response.ProductName === "Jellyfin Server") {
                    displayJellyfinInfo(response);
                } else {
                    showServerErrorScreen();
                }
            } else {
                showServerErrorScreen();
            }
        }
    };

    xhttp.open("GET", serverAddress + "/system/info/public", true);
    xhttp.send();
}

function displayJellyfinInfo(info) {
    var serverName = info.ServerName;
    var version = info.Version;
    var productName = info.ProductName;
    var operatingSystem = info.OperatingSystem;
    var id = info.Id;
    var serverAddress = atv.localStorage['jellyfin_server_address'];

    var xmlstr = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<atv>' +
        '<head>' +
        '<script src="http://jcathost.dns/js/jcm.js"/>' +
        '<script src="http://jcathost.dns/js/jellyfin-setup.js"/>' +
        '</head>' +
        '  <body>' +
        '    <optionDialog id="com.jellycat.server-response-dialog">' +
        '      <header>' +
        '        <simpleHeader accessibilityLabel="Dialog with Options">' +
        '          <title>Jellyfin Server Response:</title>' +
        '        </simpleHeader>' +
        '      </header>' +
        '      <description>JellyCAT has successfully established a connection with the Jellyfin Server and received the following response:\n\n' + productName + ' (' + serverAddress + ')' +
        '\n\nServer Name: ' + serverName + '\nVersion: ' + version +'\nOS: ' + operatingSystem + '\nid: ' + id +'\n\nTo begin viewing content, simply click on "Login" to log in to this server and receive your authentication key!</description>' +
        '      <menu>' +
        '        <initialSelection>' +
        '          <row>0</row>' +
        '        </initialSelection>' +
        '        <sections>' +
        '          <menuSection>' +
        '            <items>' +
        '              <oneLineMenuItem id="list_0" accessibilityLabel="Option 1" onSelect="authenticateJellyfin()">' +
        '                <label>Login (authenticate)</label>' +
        '              </oneLineMenuItem>' +
        '              <oneLineMenuItem id="list_1" accessibilityLabel="Option 2" onSelect="atv.unloadPage();">' +
        '                <label>Go back</label>' +
        '              </oneLineMenuItem>' +
        '            </items>' +
        '          </menuSection>' +
        '        </sections>' +
        '      </menu>' +
        '    </optionDialog>' +
        '  </body>' +
        '</atv>';
    xmlDoc = atv.parseXML(xmlstr);
    atv.loadXML(xmlDoc);

    console.log("Valid Jellyfin server: " + serverName + " " + version)
}

function showServerErrorScreen(){
    var xmlstr = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<atv>' +
        '  <body>' +
        '    <dialog id="com.jellycat.jellyfin-connect-error-dialog">' +
        '      <title>Error contacting Jellyfin Server:</title>' +
        '      <description>\nJellyCAT was unable to establish a connection with the Jellyfin Server you provided,' +
        ' or we received an invalid response. Please verify that all information is correct and try again.\n' +
        'Note that the majority of security certificates are not supported, requiring manual addition to the ATV Profile if you intend to utilize HTTPS.\n\n\n' +
        'Please let us know if you believe this is an error\n\nPress MENU to go back</description>' +
        '    </dialog>' +
        '  </body>' +
        '</atv>';
    xmlDoc = atv.parseXML(xmlstr);
    atv.loadXML(xmlDoc);

    console.log("Jellyfin Server Connection Issue")
}

function authenticateJellyfin(){
    console.log("yapppa!")
}