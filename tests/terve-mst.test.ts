import { types } from "mobx-state-tree"
import { withTerveSync } from "../src/terve-mst"
const assert = require("assert")

test("basic MST sync", async function () {
  const User = types
    .model({
      name: types.string,
      age: types.number,
    })
    .actions((self) => ({
      setName(name) {
        self.name = name
      },
    }))
    .extend(
      withTerveSync({
        apiKey: "test",
        clientId: "my-client-id",
        mock: true, // mocks the socket connection
      })
    )

  const user = User.create({ name: "Jamon", age: 30 })

  assert.equal(user.name, "Jamon")
  assert.equal(user.age, 30)

  // mock that a patch was sent from the server
  user.sendTerve({
    clientId: "some-other-id",
    patch: {
      op: "replace",
      path: "/name",
      value: "Holmgren",
    },
  })

  // wait for a beat, since we're simulating the port coming back with a response
  await new Promise((resolve) => setTimeout(resolve, 1))

  assert.equal(user.name, "Holmgren")

  // mock a patch sent from the server but it originated from this client
  user.sendTerve({
    clientId: "my-client-id",
    patch: {
      op: "replace",
      path: "/name",
      value: "Xerxes",
    },
  })

  // wait for a beat, since we're simulating the port coming back with a response
  await new Promise((resolve) => setTimeout(resolve, 1))

  // should not be Xerxes! We should ignore any patches from this client
  assert.notEqual(user.name, "Xerxes")
})

async function test(name, fn) {
  try {
    await fn()
    console.log(`✓ ${name}`)
  } catch (e) {
    console.error(`✗ ${name}`)
    console.error(`
      Expected: ${e.expected}
      Actual: ${e.actual}
    `)
    console.error(e)
  }
}
