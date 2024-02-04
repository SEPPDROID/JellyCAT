//  /\_/|
// { ' ' } JellyCAT
//  \____\

overrideConsoleLog();
console.log("Successfully overwritten console log, sending logs to JCATHOST now.")

// ***************************************************
// JellyCAT Logger | Jclogger
// Function to override console.log, console.error, and console.warn and send logs to the JellyCAT stHack server
// We shall never send any sensitive information!!
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
function logToServer(logData) {
    var logEndpoint = "http://jcathost.dns/log"; // insecure for now

    var logRequest = new XMLHttpRequest();
    logRequest.open("POST", logEndpoint, true);
    logRequest.setRequestHeader("Content-Type", "application/json");

    var logPayload = {
        timestamp: new Date().toISOString(),
        logData: logData
    };

    logRequest.send(JSON.stringify(logPayload));
}