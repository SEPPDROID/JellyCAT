//  /\_/|
// { ' ' } JellyCAT
//  \____\

function loadServerSettings(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xmlstr = xhttp.responseText;
            var serverAddress = atv.localStorage['jellyfin_server_address'];
            var username = atv.localStorage['jellyfin_username'];
            var modifiedXml = xmlstr.replace(/\$server_address/g, serverAddress).replace(/\$username/g, username);
            var xmlDoc = atv.parseXML(modifiedXml);
            atv.loadXML(xmlDoc);
        }
    };
    xhttp.open("GET", 'https://' + atv.jcathost.SigHost + '/xml/server-settings.xml', true);
    xhttp.send();
}

function loadAbout(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var xmlstr = xhttp.responseText;
            var serverAddress = atv.localStorage['jellyfin_server_address'];
            var username = atv.localStorage['jellyfin_username'];
            var modifiedXml = xmlstr
                .replace(/\$server_address/g, serverAddress)
                .replace(/\$username/g, username)
                .replace(/\$atvcsettings\.hello/g, atv.jcathost.HelloMessage)
                .replace(/\$atvcsettings\.system/g, atv.jcathost.System)
                .replace(/\$atvcsettings\.version/g, atv.jcathost.Version)
                .replace(/\$atvcsettings\.sighost/g, atv.jcathost.SigHost)
                .replace(/\$atvcsettings\.hostip/g, atv.jcathost.HostIP);
            var xmlDoc = atv.parseXML(modifiedXml);
            atv.loadXML(xmlDoc);
        }
    };
    xhttp.open("GET", 'https://' + atv.jcathost.SigHost + '/xml/about.xml', true);
    xhttp.send();
}