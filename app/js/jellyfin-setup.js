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
        "Enter the address of the Jellyfin server:",
        function(value) {
            // Save server address to localStorage
            atv.localStorage['jellyfin_server_address'] = value;
            fetchDataAndRender();
        },
        function() {
            fetchDataAndRender();
        },
        atv.localStorage['jellyfin_server_address'] || ""
    );
}

// Function to set username
function setUsername() {
    showTextEntryPage(
        "emailAddress",
        "Set Username",
        "Enter your username:",
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
        "Set Password",
        "Enter your password:",
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
