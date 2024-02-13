//  /\_/|
// { ' ' } JellyCAT
//  \____\

function printSessionStorage() {

    var keys = ['test', 'exampleKey'];

    keys.forEach(function(key) {
        var value = atv.sessionStorage.getItem(key);
        if (value !== null) {
            console.log(key + ": " + value);
        } else {
            console.log("No value found for key: " + key);
        }
    });
}

function printLocalStorage() {

    var keys = ['test', 'jellyfin_server_address', 'jellyfin_username', 'jellyfin_password', 'jellyfin_auth'];

    keys.forEach(function(key) {
        var value = atv.localStorage.getItem(key);
        if (value !== null) {
            console.log(key + ": " + value);
        } else {
            console.log("No value found for key: " + key);
        }
    });
}

function setTestSessionStorageItem() {
    // Set an example item in sessionStorage
    atv.sessionStorage.setItem('test', 'exampleValueForSessionStorage');
    console.log('Test item set in sessionStorage.');
}

function setTestLocalStorageItem() {
    // Set an example item in sessionStorage
    atv.localStorage.setItem('test', 'exampleValueForLocalStorage');
    console.log('Test item set in localStorage.');
}


