//  /\_/|
// { ' ' } JellyCAT
//  \____\

package main

import (
	"fmt"
)

type JcatDefaults struct {
	// For Setting defaults
	Version  string
	Name     string
	HostName string
	HostIP   string
}

var JellyCAT JcatDefaults

func main() {
	// Load config file for config struct
	fmt.Println()
	fmt.Println("SYS-LOG: 		Attempting to load the config...")
	loadConfig()

	// Default information store
	JellyCAT = JcatDefaults{
		Version:  "0.1.2revA",
		Name:     "JellyCAT Serving stHack",
		HostName: config.CertName,
		HostIP:   config.HijackIP,
	}

	// Starting main JellyCAT function
	fmt.Println()
	fmt.Println("			JellyCAT", JellyCAT.Version)
	fmt.Println()

	// DNS Server & Resolver function for hijacking and forwarding DNS requests
	fmt.Println("SYS-LOG: 		Attempting to start DNS Server...")
	dnsResolver()

	// Webserver for serving x and app to the ATV
	fmt.Println("SYS-LOG: 		Attempting to start WEB Server...")
	webServer()

	// App main for any other server-sided logic
	fmt.Println("SYS-LOG: 		Attempting to start JellyCAT-Main...")
	app()

	// This is working to keep all the functions alive, But is it the correct way? lmk if it's incorrect
	select {}
}
