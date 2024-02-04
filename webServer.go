//  /\_/|
// { ' ' } JellyCAT
//  \____\

package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type ATVCSettings struct {
	Hello    string `json:"hello"`
	SysSoft  string `json:"system"`
	Version  string `json:"version"`
	SigHost  string `json:"sig_host"`
	SigHostP string `json:"sig_host_p"`
	HostIP   string `json:"host_ip"`
}

type JcLogEntry struct {
	Timestamp string `json:"timestamp"`
	LogData   string `json:"logData"`
}

func webServer() {
	// Starting the webserver
	fmt.Println("WEB.SERVER-LOG:         Starting WebServer...")

	// Setting the certificate and key for SSL, that we generated with CERTGEN or other
	certFile := "assets/certificates/certificate.pem"
	keyFile := "assets/certificates/private.key"

	// Launching go routines for the servers, not sure if this is how you correctly do this.
	// Same goes for DNS where I used a similar approach...
	go startHTTPSServer(certFile, keyFile)
	fmt.Println("WEB.SERVER-LOG:         WebServer HTTPS is ready and listening on *:443")
	go startHTTPServer(config.HttpPort)
	fmt.Println("WEB.SERVER-LOG:         WebServer HTTP is ready and listening on *:80")

}

func startHTTPSServer(certFile, keyFile string) {
	// Setting up app folder as the "main" root for serving (static)/JS files
	fileServer := http.FileServer(http.Dir("app"))

	// Serving the main app at /
	http.Handle("/", logHandler(fileServer))

	// Setting up location for the certificate for ATV, without exposing the private key.
	http.HandleFunc("/certificate.cer", func(w http.ResponseWriter, r *http.Request) {
		logRequest(r)
		http.ServeFile(w, r, "assets/certificates/certificate.cer")
	})

	http.HandleFunc("/log", jclogHandler)

	// Set up the route for the atvcsettings info
	settings := ATVCSettings{
		Hello:    "you have reached JCATHOST and i have got some goodies for u",
		SysSoft:  JellyCAT.Name,
		Version:  JellyCAT.Version,
		SigHost:  JellyCAT.HostName,
		SigHostP: config.HttpsPort,
		HostIP:   config.HijackIP,
	}
	http.HandleFunc("/atvcsettings", func(w http.ResponseWriter, r *http.Request) {
		logRequest(r)
		handleATVCSettings(w, r, settings)
	})

	// And finally serving over tls
	err := http.ListenAndServeTLS(config.HttpsPort, certFile, keyFile, nil)
	if err != nil {
		fmt.Print("\033[A\r")
		fmt.Println("WEB.SERVER-ERR:         Error starting HTTPS server:", err)
		// Let's not check what the error is but just assume it's missing certificates
		fmt.Println("WEB.SERVER-ERR:         Did you run 'CERTGEN'? ")
		// Don't exit, but give a chance to run certgen
		resetCommand()
	}

}

func startHTTPServer(addr string) {
	// Setting up and running a simple HTTP server for certificate retrieving and other insecure tasks...
	// Might have to set up that only specific locations can be accessed by HTTP and force the rest HTTPS #todo?
	// There also has to be a better way instead of starting 2 server functions? help
	err := http.ListenAndServe(addr, nil)
	if err != nil {
		// Just error don't close out
		fmt.Println("WEB.SERVER-ERR:         Error starting HTTP server:", err)
	}
}

func handleATVCSettings(w http.ResponseWriter, r *http.Request, settings ATVCSettings) {

	// Set the content type to JSON
	w.Header().Set("Content-Type", "application/json")
	// allowing anyone to use this json with cors
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Encode the struct to JSON and write it to the response writer
	err := json.NewEncoder(w).Encode(settings)
	if err != nil {
		logRequest(r)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func jclogHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	// Parse the JSON payload
	var logPayload JcLogEntry
	err = json.Unmarshal(body, &logPayload)
	if err != nil {
		http.Error(w, "Error parsing JSON payload", http.StatusBadRequest)
		return
	}

	// Handle the log data as needed
	fmt.Print("\033[A\r")
	fmt.Printf("JellyCAT-APP-LOG:	Received log at %s:\nJellyCAT-APP-LOG:\t%s\n", logPayload.Timestamp, logPayload.LogData)
	resetCommand()

	// Respond to the client
	w.WriteHeader(http.StatusOK)
}

func logHandler(next http.Handler) http.Handler {
	// Basic logging function to see all incoming traffic, as im not sure yet what the ATV exactly wants
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logRequest(r)
		next.ServeHTTP(w, r)
	})
}

func logRequest(r *http.Request) {
	// Write to the console with my hacky print & reset :)
	fmt.Print("\033[A\r")
	fmt.Printf("WEB.SERVER-LOG:         [%s] %s %s  \n", r.RemoteAddr, r.Method, r.URL)
	// fmt.Println(r.Body, r.Header)
	resetCommand()
}
