# Terve Sync

_Terve means "hello" in Finnish._

This is an experimental library by Jamon Holmgren which allows for
synchronization of MobX-State-Tree stores (and possibly others in the
future) via an Elixir/Phoenix server I'm calling "Terve Server".

## Do you need this?

Are you:

- Using [MobX-State-Tree](https://mobx-state-tree.js.org)
- Wanting to synchronize your store(s) across many devices
- Not wanting to have to build it all yourself

... then you might find this useful.

## Usage

1. Sign up for a Terve Server account (coming soon)
2. Get an API key (coming soon)
3. Add the library to your client (`yarn add terve-sync`)
4. Add this to any MST store you want to synchronize:

```ts
const SynchronizedStore = types.model("SynchronizedStore", { ... })
  .views(...)
  .actions(...)
  .extend(
    withTerveSync({
      apiKey: "some-api-key"
    }),
  )
```

## Caveats

Since this is an experiment I built in a weekend, I haven't implemented a lot of things that you'd want with a production service.

- No authorization
- No server-side validations -- just rebroadcasts whatever it's sent, to everyone on the channel
- No server-side throttling
- Since this is pretty much client-driven (like Firestore), it would be _very_ easy for someone to hack their client and cheat in their game or hack messages or whatever
- Use at your own risk!

## Contributing

Open an issue and let me know what you're thinking! And [send it to me on Twitter](https://twitter.com/jamonholmgren) or email me, as I rarely look at Github issues.
