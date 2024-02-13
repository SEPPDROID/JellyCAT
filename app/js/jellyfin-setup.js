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
        },
        function() {

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
        },
        function() {

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
        },
        function() {

        },
        atv.localStorage['jellyfin_password'] || ""
    );
}
