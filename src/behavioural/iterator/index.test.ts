import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { IteratorOutOfBoundsError, List } from "./index.ts";

describe("iterator pattern", () => {
  describe("iterator", () => {
    describe("instantiated classes", () => {
      test("successfully initialises a List aggregate with working collection operations", () => {
        const list = new List();

        assert.strictEqual(list.getCount(), 0);

        list.append("First");
        list.append("Second");

        assert.deepEqual(list.getItems(), ["First", "Second"]);

        list.remove("First");
        assert.deepEqual(list.getItems(), ["Second"]);
      });

      test("successfully initialises a List aggregate with working Iterator", () => {
        const list = new List();
        const listIterator = list.getIterator();

        assert.strictEqual(listIterator.currentItem(), undefined);

        list.append("First");
        assert.strictEqual(listIterator.currentItem(), "First");
      });
    });

    test("successfully traverses a collection", () => {
      const list = new List();
      const listIterator = list.getIterator();
      assert.strictEqual(listIterator.currentItem(), undefined);

      // Confirm we begin on the first indexed item.
      ["First", "Second", "Third"].map((item) => list.append(item));
      assert.strictEqual(listIterator.currentItem(), "First");
      assert.strictEqual(listIterator.isDone(), false);

      // Confirm we move to the next indexed item.
      const nextInList = listIterator.next();
      assert.strictEqual(nextInList, "Second");
      assert.strictEqual(listIterator.isDone(), false);

      // Confirm we move to the final indexed item.
      const lastInList = listIterator.next();
      assert.strictEqual(lastInList, "Third");
      assert.strictEqual(listIterator.isDone(), false);

      // Confirm we have finished traversing the list.
      const endOfList = listIterator.next();
      assert.strictEqual(endOfList, undefined);
      assert.throws(() => listIterator.currentItem(), IteratorOutOfBoundsError);

      // Confirm we can move back to the first indexed item.
      assert.strictEqual(listIterator.first(), "First");
      assert.strictEqual(listIterator.isDone(), false);
    });

    test("throws an out-of-bounds error if the iteration has already terminated", () => {
      const list = new List();
      const listIterator = list.getIterator();

      list.append("First");

      listIterator.next();

      assert.strictEqual(listIterator.isDone(), true);
      assert.throws(() => listIterator.currentItem(), IteratorOutOfBoundsError);
    });
  });
});
