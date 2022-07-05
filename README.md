# Terve

_Terve means "hello" in Finnish._

This is an experimental library by Jamon Holmgren which allows for
synchronization of MobX-State-Tree stores (and possibly others in the
future) via an Elixir/Phoenix server I'm calling "Terve".

## Do you need this?

Are you:

- Using [MobX-State-Tree](https://mobx-state-tree.js.org)
- Wanting to synchronize your store(s) across many devices
- Not wanting to have to build it all yourself

... then you might find this useful.

## Usage

1. Sign up for a Terve Server account (coming soon)
2. Get an API key (coming soon)
3. Add the library to your client (`yarn add terve`)
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
