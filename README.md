# Jam - A Social Password Manager

Here lies Jam, an open source password manager that used to live at https://jam.link.

If you're reading this, it means I have officially shut down Jam for good. Thank you to everyone who used Jam and, if you're reading this, thank you for taking a special interest in the code.

Jam is a web app with a Chrome extension that let you do basically two neat things:

1. Share passwords with friends securely
2. Share access to websites with friends without disclosing your password

Under the hood, everything in Jam is encrypted using a mix of different cryptography tricks. For example, the master key for each account is derived using a protocol called "Secure Remote Password." Without getting into the nitty gritty, a correct password then decrypts a set of other keys which then are used to encrypt and decrypt "data keys" which are used for sharing sensitive information.

The "magic login" feature is then just a special case of sharing a login. The Chrome extension uses some privileged APIs that Chrome exposes in order to slurp up cookies and local storage for the website the user is currently on. That data is then encrypted and written to Jam. When someone else activates that magic link, their Chrome extension attempts to inject all of the same state into the webpage on the new device. This works a decent amount of the time, but not every time.

I decided to shutdown Jam for personal reasons (time, money, etc). I hope this repo is somehow helpful to others. There is no guide on deploying this system (and there never will be), but if you want to read the code and try to figure it out then be my guest. Please note though that I intentionally have licensed this repository so that personal reuse is fine, but repurposing Jam for your own commercial use is not. If you want to use Jam commercially in your own venture, contact me.

With that out of the way, I leave you with the sparse, out of date, and almost certainly incomplete original README page:

## Cryptograph overview

When a user creates an account, three salts are generated:

- `srpSalt` (by the secure-remote-password library)
- `srpPbkdf2Salt` - additional entropy for the derivation of the private key for used for SRP auth
- `masterKeyPbkdf2Salt` - additional entropy for deriving the master key for the account

Then two private keys are derived, one for SRP auth and the other key for encrypting and decrypting our private key / public key pair.

- `masterKeyPbkdf2Salt` is separate from `srpPbkdf2Salt` since the master key salt would only be revealed at the end of a successful SRP authentication

## Development

### Setup

- Run `yarn` for packages
- `createdb jam-dev` then `bin/migrate`

### Run

You can probably just run `bin/dev` which should cover everything. That
just launches all of these:

- `bin/dev-server` to launch backend
- `yarn start` to launch frontend
- `yarn run graphql-codegen --watch` to launch a process that generates TypeScript bindings
  based on our GraphQL definitions

they all output to the console and clear it though, so you might want to just run them separately

### Test

- Integration test with `bin/integration-test`. It's separate from `create-react-app` for mysterious reasons

### Explore

- Visit `http://localhost:5000/graphql` for GraphQL explorer
