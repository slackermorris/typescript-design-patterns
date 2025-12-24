import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { Box, Product } from "./composite-with-iterator.ts";

describe("composite with iterator pattern", () => {
  test("successfully calculates the total price of a Box containing a single Product", () => {
    const box = new Box();
    box.append(new Product());

    const totalNetPrice = box.netPrice();

    assert.strictEqual(totalNetPrice, 20);
  });

  test(
    "successfully calculates the total price of a Box containing many Boxes",
    { only: true },
    () => {
      /**
       * Structure being tested:
       *
       *  📦 Big Box
       *  ├── 📦 Medium Box
       *  │   └── 📦 Small Box
       *  │       ├── 🏷️ Product ($20)
       *  │       └── 🏷️ Product ($20)
       *  ├── 🏷️ Product ($20)
       *  └── 🏷️ Product ($20)
       *
       *  Total: $80 (4 products × $20)
       */

      const bigBox = new Box();
      const mediumBox = new Box();
      const smallBox = new Box();

      const product = new Product();
      const product2 = new Product();
      const product3 = new Product();
      const product4 = new Product();

      smallBox.append(product);
      smallBox.append(product2);
      mediumBox.append(smallBox);
      bigBox.append(mediumBox);
      bigBox.append(product3);
      bigBox.append(product4);

      const totalNetPrice = bigBox.netPrice();

      assert.strictEqual(totalNetPrice, 80);
    }
  );
});
