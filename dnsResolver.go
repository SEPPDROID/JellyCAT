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
	server := &dns.Server{Addr: ":53", Net: "udp"}
	dns.HandleFunc(".", handleDNSRequest)

	go func() {
		if err := server.ListenAndServe(); err != nil {
			fmt.Println("DNS.SERVER-ERR: 	Failed to start DNS server:", err)
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
		if shouldHijack(q.Name, q.Qtype) {
			handleHijackedRequest(q.Name)
			addHijackedAnswer(m, q.Name)
		} else {
			forwardRequest(m, r)
		}
	}

	err := w.WriteMsg(m)
	if err != nil {
		fmt.Print("\033[A\r")
		fmt.Println("DNS.SERVER-ERR: 	Error writing response:", err)
		resetCommand()
	}
}

func shouldHijack(name string, qtype uint16) bool {
	return (name == config.HijackApp || name == config.HijackImg || name == "jcathost.dns.") && (qtype == dns.TypeA || qtype == dns.TypeAAAA)
}

func handleHijackedRequest(name string) {
	fmt.Print("\033[A\r")
	fmt.Println("DNS.SERVER-LOG: 	DNS LOOKUP Hijacked for", name)
	resetCommand()
}

func addHijackedAnswer(m *dns.Msg, name string) {
	rr, err := dns.NewRR(fmt.Sprintf("%s IN A %s", name, config.HijackIP))
	if err == nil {
		m.Answer = append(m.Answer, rr)
	}
}

func forwardRequest(m *dns.Msg, r *dns.Msg) {
	resolver := &dns.Client{}
	resp, _, err := resolver.Exchange(r, net.JoinHostPort(config.ForwardIP, config.ForwardPort))
	if err == nil {
		m.Answer = append(m.Answer, resp.Answer...)
	}
	fmt.Print("\033[A\r")
	fmt.Println("DNS.SERVER-LOG: 	DNS LOOKUP forwarded for", r.Question[0].Name, "| uninterested")
	resetCommand()
}
