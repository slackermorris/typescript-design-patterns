import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { Box, Component, Product } from "./index.ts";

describe("composite pattern", () => {
  describe("child management operations", () => {
    test('returns a null pointer when determining if Product is a "composite" class', () => {
      const product = new Product();

      assert.equal(product.getBox(), 0);
    });

    test('returns an instance of Box when determining if Box is a "composite" class', () => {
      const box = new Box();

      assert.equal(box.getBox(), box);
    });

    test("only Boxes have child management operations exposed on them", () => {
      const product = new Product();

      // @ts-expect-error - Product does not have add and remove operations
      assert.equal(product.add, undefined);
      // @ts-expect-error - Product does not have add and remove operations
      assert.equal(product.remove, undefined);

      const box = new Box();

      assert(typeof box.add === "function");
      assert(typeof box.remove === "function");
    });

    test("Box can add children", () => {
      const box = new Box();
      const productToAdd = new Product();

      box.add(productToAdd);
      assert.strictEqual(box.getChild(0), productToAdd);
    });

    test("Box can remove children", () => {
      const box = new Box();
      const productToAdd = new Product();

      box.add(productToAdd);
      assert.strictEqual(box.getChild(0), productToAdd);

      box.remove(productToAdd);
      assert.strictEqual(box.getChild(0), undefined);
    });

    test("does not fail if Box tries to remove a child that does not exist", () => {
      const box = new Box();
      const productToRemove = new Product();

      assert.doesNotThrow(() => box.remove(productToRemove));
    });

    test("fails to delete a child that is not referentially stable", () => {
      const box = new Box();
      const productToAdd = new Product();

      // Add a product and confirm it exists as a child of the box.
      box.add(productToAdd);
      assert.strictEqual(box.getChild(0), productToAdd);

      // Remove the product a copy of the product we just added.
      const productToRemove: Product = Object.assign({}, productToAdd);
      box.remove(productToRemove);

      // Confirm that the deletion did not happen because the deletion logic depends on referential stability.
      assert.strictEqual(box.getChild(0), productToAdd);
    });
  });

  describe("accessing children", () => {
    test("never returns children for a Product", () => {
      const product = new Product();

      assert.equal(product.getChild(0), undefined);
    });

    test("returns undefined if index is out of bounds for Box", () => {
      const outOfBoundsIndex = Infinity;

      const box = new Box();

      assert.equal(box.getChild(outOfBoundsIndex), undefined);
    });

    test("returns undefined if index is out of bounds for Box", () => {
      const outOfBoundsIndex = Infinity;

      const box = new Box();

      assert.equal(box.getChild(outOfBoundsIndex), undefined);
    });

    test("returns a Product if index is in Box's childrens list is legitimate", () => {
      const legitimateChildIndex = 0;

      const box = new Box();

      const productInsideBox = new Product();
      box.add(productInsideBox);

      assert.equal(box.getChild(legitimateChildIndex), productInsideBox);
    });
  });

  describe("component operations", () => {
    test("Box returns a string when performing an operation", () => {
      const box = new Box();

      assert(typeof box.operation() === "string");
    });

    test("Product returns a string when performing an operation", () => {
      const product = new Product();

      assert(typeof product.operation() === "string");
    });
  });
});
