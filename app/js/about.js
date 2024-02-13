//  /\_/|
// { ' ' } JellyCAT
//  \____\

//----------------------------DOMView--------------------------------------------

var JCATAboutXML = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<atv>\n' +
    '    <head>\n' +
    '    </head>\n' +
    '    <body>\n' +
    '        <scrollingText id="com.jellycat.jcatabout" initialSelection="1">\n' +
    '            <title>JellyCAT About</title>\n' +
    '            <text><![CDATA[\n' +
    '//  /\\_/ |\n' +
    '// { \'  \'  }   JellyCAT\n' +
    '//  \\____\\\n' +
    '\n' +
    'ENGLISH | ABOUT\n' +
    '      \n' +
    'JellyCAT $atvcsettings.version\n' +
    '      \n' +
    'Thank you for using JellyCAT! A (hacky) Jellyfin client for Apple TV 2 & 3.\n' +
    '      \n' +
    '== soon more ==\n' +
    '      \n' +
    '\n\n\n' +
    '-=JellyCAT Server (JCHOST) Information=-\n' +
    '\n\n' +
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
    '\n' +
    '-=Jellyfin Client settings=-\n' +
    '      ]]></text>\n' +
    '            <buttons>\n' +
    '                <actionButton onSelect="DomViewManager.unloadView(\'JcatAboutView\');" id="close">\n' +
    '                    <title>Close</title>\n' +
    '                </actionButton>\n' +
    '            </buttons>\n' +
    '        </scrollingText>\n' +
    '    </body>\n' +
    '</atv>';


JCATAboutXML = JCATAboutXML
    .replace(/\$atvcsettings\.hello/g, atv.jcathost.HelloMessage)
    .replace(/\$atvcsettings\.system/g, atv.jcathost.System)
    .replace(/\$atvcsettings\.version/g, atv.jcathost.Version)
    .replace(/\$atvcsettings\.sighost/g, atv.jcathost.SigHost)
    .replace(/\$atvcsettings\.hostip/g, atv.jcathost.HostIP);


function generateJCATAboutXML() {
    var doc = atv.parseXML( JCATAboutXML );

    console.log( "Creating the view --> " );
    DomViewManager.createView( "JcatAboutView" );

    console.log( "Loading the view --> " );
    DomViewManager.loadView( "JcatAboutView", doc );

    console.log( "View is loaded" );
}