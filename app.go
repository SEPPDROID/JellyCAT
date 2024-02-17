//  /\_/|
// { ' ' } JellyCAT
//  \____\

package main

import (
	"bufio"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

func app() {
	// This is the main app function for all the logic I need

	// jclogHelper is a function that im not sure is safe enough to keep... It listens for log information I send from the JS-App.
	// But opens yet another hole...
	fmt.Println("JellyCAT-LOG: 		Starting JellyCAT-LogHelper")
	// Good news: Using the webserver now, so I won't have to add yet another go routine
	// keeping the logMSG for aesthetics only :)
	// go jclogHelper()
	fmt.Println("JellyCAT-APP-LOG:	Ready to print JellyCAT APP-LOG, listening on /log")

	fmt.Println("JellyCAT-LOG: 		Starting CI...")
	fmt.Println()

	// Command interface, that makes it easy to add functionality, run or stop them (that was the plan)
	for {
		fmt.Print("Enter a command: ")
		input := getUserInput()

		switch strings.ToLower(input) {
		case "help":
			displayHelp()
		case "exit":
			fmt.Println("Exiting JellyCAT & Stopping Servers. Goodbye!")
			os.Exit(0)
		case "clear":
			clearScreen()
		case "cinfo":
			displayCinfo()
		case "certgen":
			certGen()
		default:
			fmt.Println("Invalid command. Type 'help' for assistance, or 'exit' to quit")
			fmt.Println()
		}
	}
}

func resetCommand() {
	// A simple & hacky way of removing and resetting the "Enter command" prompt, works for now? but I need better logging... #todo
	// I could've created a simple function that takes the log string and then resets the enter command text. Oh well.
	fmt.Print("\033[K")
	fmt.Println()
	fmt.Print("Enter a command: ")
}

func getUserInput() string {
	// Handles user input for the for case loop
	reader := bufio.NewReader(os.Stdin)
	input, _ := reader.ReadString('\n')
	return strings.TrimSpace(input)
}

func displayHelp() {
	// Simple help information print
	fmt.Println()
	fmt.Println("========== JellyCAT Help Menu ===========")
	fmt.Println("|          Available commands:          |")
	fmt.Println("=========================================")
	fmt.Println("| - help    : Display this help menu    |")
	fmt.Println("| - exit    : Exit the application      |")
	fmt.Println("| - clear   : Clear the screen          |")
	fmt.Println("| - cinfo   : Config Info               |")
	fmt.Println("| - certgen : generate Cert&key         |")
	fmt.Println("=========================================")
	fmt.Println()
	fmt.Println()
}

func displayCinfo() {
	var dnsStatus string
	var webStatus string

	if config.DnsServEN {
		dnsStatus = "Enabled"
	} else {
		dnsStatus = "Disabled"
	}

	if config.WebServEN {
		webStatus = "Enabled"
	} else {
		webStatus = "Disabled"
	}

	fmt.Println()
	fmt.Println("============ JellyCAT Config =============")
	fmt.Println("|    Current config & Information:     	 |")
	fmt.Println("==========================================")
	fmt.Println("|           *** Services ***           	 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|        DNS SERVER :", dnsStatus, "         	 |")
	fmt.Println("|        WEB SERVER :", webStatus, "         	 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|        *** Current Config ***        	 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|             *** DNS ***        	 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|   hijack_ip    = ", config.HijackIP, "	 |")
	fmt.Println("|   hijack_app   = ", config.HijackApp, "	 |")
	fmt.Println("|   hijack_img   = ", config.HijackImg, "	 |")
	fmt.Println("|   forward_ip   = ", config.ForwardIP, "		 |") // any big ip address and my design tabs too far :( haha
	fmt.Println("|   forward_port = ", config.ForwardPort, "			 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|             *** WEB ***        	 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|   https_port   = ", config.HttpsPort, "		 |")
	fmt.Println("|   https_port   = ", config.HttpPort, "		 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|           *** CERTGEN ***        	 |")
	fmt.Println("|                                     	 |")
	fmt.Println("|   common_name   = ", config.CertName, "	 |")
	fmt.Println("|                                     	 |")
	fmt.Println("==========================================")
	fmt.Println("| https://github.com/SEPPDROID/JellyCAT  |")
	fmt.Println("| for more information & example cfg	 |")
	fmt.Println("==========================================")
	fmt.Println()
	fmt.Println()
}

func clearScreen() {
	// Clearing the screen, a bit spooky using runtime.GOOS and exec... But seems to be how others do it too?
	switch runtime.GOOS {
	case "linux", "darwin":
		cmd := exec.Command("clear")
		cmd.Stdout = os.Stdout
		cmd.Run()
		fmt.Println()
	case "windows":
		cmd := exec.Command("cmd", "/c", "cls")
		cmd.Stdout = os.Stdout
		cmd.Run()
		fmt.Println()
	default:
		fmt.Println("JellyCAT-ERR: \t\tCan't clear screen: Unsupported operating system!")
		// Better safe than sorry
	}
}

func certGen() {
	// Certgen is the function that generates a certificate and key set
	fmt.Println()
	fmt.Println("CERTGEN-LOG: \t\tGenerating key & certificates...")
	// Generate a private key
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError generating private key:", err)
		return
	}

	// Generate a serial number for the certificate
	// Doesn't seem completely necessary but openssl generates one, and so do we.
	serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError generating certificate serial number:", err)
		return
	}

	// Create a template for the certificate
	// ATV is very picky, has to be like this or it no workie. Its working now, so I'm scared to touch/change anything
	// ATV needs a common name not an organisation, my bad.
	template := x509.Certificate{
		SerialNumber: serialNumber,
		Subject: pkix.Name{
			Country: []string{"US"},
			//	Organization: []string{"appletv.flickr.com"},
			CommonName: config.CertName,
		},
		NotBefore: time.Now(),
		NotAfter:  time.Now().Add(365 * 24 * time.Hour * 20),
		//	KeyUsage:  x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		//	ExtKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		IsCA:                  true,
	}

	// Add Subject Key Identifier extension, because openssl adds one.
	subjectKeyID, err := generateSubjectKeyID(&privateKey.PublicKey)
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError generating Subject Key Identifier:", err)
		return
	}
	template.SubjectKeyId = subjectKeyID

	// Add Authority Key Identifier extension, because openssl adds one.
	authorityKeyID, err := generateAuthorityKeyID(&privateKey.PublicKey)
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError generating Authority Key Identifier:", err)
		return
	}
	template.AuthorityKeyId = authorityKeyID

	// Generate the certificate
	certDER, err := x509.CreateCertificate(rand.Reader, &template, &template, &privateKey.PublicKey, privateKey)
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError creating certificate:", err)
		return
	}

	// Save private key to file
	privateKeyFile, err := os.Create("assets/certificates/private.key")
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError creating private key file:", err)
		return
	}
	err = pem.Encode(privateKeyFile, &pem.Block{Type: "PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(privateKey)})
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError creating private key file:", err)
		return
	}
	privateKeyFile.Close()

	// Save certificate to file
	certFile, err := os.Create("assets/certificates/certificate.pem")
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError creating certificate file:", err)
		return
	}
	err = pem.Encode(certFile, &pem.Block{Type: "CERTIFICATE", Bytes: certDER})
	if err != nil {
		fmt.Println("CERTGEN-ERR: \t\tError creating certificate file:", err)
		return
	}
	certFile.Close()

	// Now we create a .cer security certificate from the PEM file for the ATV's profile system
	fmt.Println("CERTGEN-LOG: \t\tCertificate and private key generated successfully.")
	fmt.Println("CERTGEN-LOG: \t\tConverting PEM to DER for ATV Profile...")
	generateDerCer()
}

func generateSubjectKeyID(publicKey *rsa.PublicKey) ([]byte, error) {
	// Marshal the public key to DER format
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return nil, err
	}

	// Calculate the SHA-1 hash of the DER-encoded public key
	hash := sha1.Sum(publicKeyBytes)

	return hash[:], nil
}

func generateAuthorityKeyID(publicKey *rsa.PublicKey) ([]byte, error) {
	// Yup you guessed it, the openssl conf creates one too. (not like this I think lol)
	return generateSubjectKeyID(publicKey)
}

func generateDerCer() {
	inputFile := "assets/certificates/certificate.pem"
	outputFile := "assets/certificates/certificate.cer"

	err := convertPEMToDER(inputFile, outputFile)
	if err != nil {
		// stop goroutine on error
		panic(err)
	}

	fmt.Println("CERTGEN-LOG: \t\tConversion to DER successful!")
	fmt.Println("CERTGEN-LOG: \t\tPlease restart JellyCAT to load new certificate") // we could reload the webserver with the new cert, but nah.
	fmt.Println()
}

func convertPEMToDER(inputFile string, outputFile string) error {
	// Read the PEM-encoded certificate from the input file
	pemData, err := os.ReadFile(inputFile)
	if err != nil {
		return err
	}

	// Decode the PEM block
	block, _ := pem.Decode(pemData)
	if block == nil {
		return err
	}

	// Parse the X.509 certificate
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return err
	}

	// Convert the certificate to DER format
	derCertificate := cert.Raw

	// Create or open the DER-encoded certificate file for writing
	outputFileHandle, err := os.Create(outputFile)
	if err != nil {
		return err
	}
	defer outputFileHandle.Close()

	// Write the DER-encoded certificate to the output file
	_, err = outputFileHandle.Write(derCertificate)
	if err != nil {
		return err
	}

	return nil
}
