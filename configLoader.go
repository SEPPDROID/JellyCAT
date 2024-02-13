//  /\_/|
// { ' ' } JellyCAT
//  \____\

package main

import (
	"fmt"
	"github.com/BurntSushi/toml"
	"os"
)

type Config struct {
	HijackIP    string `toml:"hijack_ip"`
	HijackApp   string `toml:"hijack_app"`
	HijackImg   string `toml:"hijack_img"`
	ForwardIP   string `toml:"forward_ip"`
	ForwardPort string `toml:"forward_port"`
	HttpsPort   string `toml:"https_port"`
	HttpPort    string `toml:"http_port"`
	CertName    string `toml:"common_name"`
}

var config Config

func loadConfig() {
	// Reading config from settings.cfg file
	fmt.Println("SYS-LOG: 		Loading Config...")
	data, err := os.ReadFile("settings.cfg")
	if err != nil {
		fmt.Println("SYS-ERR: 		Error reading 'settings.cfg' config file:", err)
		os.Exit(1)
	}

	if _, err := toml.Decode(string(data), &config); err != nil {
		fmt.Println("SYS-ERR: 		Error decoding config file:", err)
		os.Exit(1)
	}
	fmt.Println("SYS-LOG: 		Config Loaded!")
	// Config loaded and ready to go back to the main function!
}
