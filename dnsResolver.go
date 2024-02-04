//  /\_/|
// { ' ' } JellyCAT
//  \____\

package main

import (
	"fmt"
	"net"
	"os"

	"github.com/miekg/dns"
)

func dnsResolver() {
	// Setting up the dns server to listen on 53, currently hardcoded because that's the default dns port.
	server := &dns.Server{Addr: ":53", Net: "udp"}
	dns.HandleFunc(".", handleDNSRequest)

	go func() {
		if err := server.ListenAndServe(); err != nil {
			fmt.Println("DNS.SERVER-ERR: 	Failed to start DNS server:", err)
			// Just exit if it errors, since it's the main function of using this "sthack"
			os.Exit(1)
		}
	}()

	fmt.Println("DNS.SERVER-LOG: 	DNS server is ready and listening on *:53")

}

func handleDNSRequest(w dns.ResponseWriter, r *dns.Msg) {
	m := new(dns.Msg)
	m.SetReply(r)
	m.Compress = false

	for _, q := range r.Question {
		if (q.Name == config.HijackApp || q.Name == config.HijackImg || q.Name == "jcathost.dns.") && (q.Qtype == dns.TypeA || q.Qtype == dns.TypeAAAA) {
			// Resolve hijack domain app to the IP addresses from the config
			// Had to add some trippy quadA detection, since ipv6 (AAAA) requests would end up funky
			fmt.Print("\033[A\r")
			fmt.Println("DNS.SERVER-LOG: 	DNS LOOKUP Hijacked for", q.Name)
			resetCommand()
			rr, err := dns.NewRR(fmt.Sprintf("%s IN A %s", q.Name, config.HijackIP))
			if err == nil {
				m.Answer = append(m.Answer, rr)
			}
		} else {
			// Forward other requests to the IP address from the config
			resolver := &dns.Client{}
			resp, _, err := resolver.Exchange(r, net.JoinHostPort(config.ForwardIP, "53"))
			fmt.Print("\033[A\r")
			fmt.Println("DNS.SERVER-LOG: 	DNS LOOKUP forwarded for", q.Name, "| uninterested")
			resetCommand()
			if err == nil {
				m.Answer = append(m.Answer, resp.Answer...)
			}
		}
	}

	// Not sure if this is correct, my IDE autocorrect wanted to do it this way...
	err := w.WriteMsg(m)
	if err != nil {
		return
	}
}
