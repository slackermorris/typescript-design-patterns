import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { Box, Product } from "./index.ts";

describe("composite pattern", () => {
  test.todo("only Boxes have child management operations exposed on them");

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
});
