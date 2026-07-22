import dns from "dns";
import { promisify } from "util";
import net from "net";

const dnsLookup = promisify(dns.lookup);

/**
 * Checks if a given IP address belongs to a private, loopback, link-local,
 * or otherwise unsafe local network range.
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;
    const [a, b, c, d] = parts;

    // Loopback: 127.0.0.0/8
    if (a === 127) return true;
    // Private Network (Class A): 10.0.0.0/8
    if (a === 10) return true;
    // Private Network (Class B): 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return true;
    // Private Network (Class C): 192.168.0.0/16
    if (a === 192 && b === 168) return true;
    // Link-local: 169.254.0.0/16
    if (a === 169 && b === 254) return true;
    // Broadcast/Local: 0.0.0.0/8
    if (a === 0) return true;

    return false;
  } else if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase().trim();

    // Loopback: ::1
    if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
    // Link-local: fe80::/10
    if (normalized.startsWith("fe80:") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
    // Unique local address: fc00::/7 (fc00:: to fdff::)
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    // Unspecified: ::
    if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

    return false;
  }

  // Reject unrecognized format as unsafe
  return true;
}

/**
 * Validates a URL to ensure it points to a safe public IP address.
 */
export async function isSafeUrl(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);
    
    // Only HTTP and HTTPS protocols are allowed
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname;
    if (!hostname) {
      return false;
    }

    // Check if the hostname is already an IP address
    if (net.isIP(hostname)) {
      return !isPrivateIp(hostname);
    }

    // Resolve domain name to all IP addresses
    const addresses = await dnsLookup(hostname, { all: true });
    
    // Ensure all resolved addresses are public IPs
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("SSRF check failed for URL:", urlStr, error);
    return false;
  }
}
