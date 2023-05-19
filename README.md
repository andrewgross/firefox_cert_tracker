## Firefox Cert Track

A simple browser extension to track cert chains for HTTPS websites and alert when they change.

### How it works

* Uses Firefox security APIs and the `onHeadersReceived` event to see the full certificate chain for any HTTPS request.
* Generates a fingerprint for the full cert chain all the way to root
* Maps a hostname to a fingerprint, and that finger print to the detailed cert info
* When a hostname presents a chain that is new, record the new chain, and `alert()` the user (this just logs to console for background extensions)
* When a hostname presents a known chain, just update the `last_seen` time

### Future Work

* Build a UI to actually explore certs for sites you have seen so far
* Build a better way to alert the user when a chain has changed
* Probably need to optimize the data structes since it is just naive maps and some strings for now
* Figure out a way to anonymously aggregate this data across many users of the extension to see changes over time (HTTPS Everywhere from the EFF kinda does this already)
* Actually learn JS instead of the hacks I have here
