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

	certFile := "assets/certificates/certificate.pem"
	keyFile := "assets/certificates/private.key"

	go startHTTPSServer(certFile, keyFile)
	fmt.Println("WEB.SERVER-LOG:         WebServer HTTPS is ready and listening on *" + config.HttpsPort)
	go startHTTPServer(config.HttpPort)
	fmt.Println("WEB.SERVER-LOG:         WebServer HTTP is ready and listening on *" + config.HttpPort)
}

func startHTTPSServer(certFile, keyFile string) {
	fileServer := http.FileServer(http.Dir("app"))
	http.Handle("/", logHandler(fileServer))

	http.HandleFunc("/certificate.cer", func(w http.ResponseWriter, r *http.Request) {
		logRequest(r)
		http.ServeFile(w, r, "assets/certificates/certificate.cer")
	})

	http.HandleFunc("/log", jclogHandler)

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

	err := http.ListenAndServeTLS(config.HttpsPort, certFile, keyFile, nil)
	if err != nil {
		handleServerError("Error starting HTTPS server:", err)
	}
}

func startHTTPServer(addr string) {
	err := http.ListenAndServe(addr, nil)
	if err != nil {
		handleServerError("Error starting HTTP server:", err)
	}
}

func handleATVCSettings(w http.ResponseWriter, r *http.Request, settings ATVCSettings) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

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

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}

	var logPayload JcLogEntry
	err = json.Unmarshal(body, &logPayload)
	if err != nil {
		http.Error(w, "Error parsing JSON payload", http.StatusBadRequest)
		return
	}

	fmt.Print("\033[A\r")
	fmt.Printf("JellyCAT-APP-LOG:	Received log at %s:\nJellyCAT-APP-LOG:\t%s\n", logPayload.Timestamp, logPayload.LogData)
	resetCommand()

	w.WriteHeader(http.StatusOK)
}

func logHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logRequest(r)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		next.ServeHTTP(w, r)
	})
}

func logRequest(r *http.Request) {
	fmt.Print("\033[A\r")
	fmt.Printf("WEB.SERVER-LOG:         [%s] %s %s  \n", r.RemoteAddr, r.Method, r.URL)
	resetCommand()
}

func handleServerError(message string, err error) {
	fmt.Print("\033[A\r")
	fmt.Println("WEB.SERVER-ERR:        ", message, err)
	fmt.Println("WEB.SERVER-ERR:         Did you run 'CERTGEN'?")
	resetCommand()
}
