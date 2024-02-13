//  /\_/|
// { ' ' } JellyCAT
//  \____\

//----------------------------DOMView--------------------------------------------

var JCATHOSTInfoXML = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<atv>\n' +
    '    <head>\n' +
    '    <script src="http://jcathost.dns/js/settingloader.js"/>\n' +
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
    '                <actionButton onSelect="loadAbout();" id="about">\n' +
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

// I will keep this DomView generator for reference, however I like my new way of templating better