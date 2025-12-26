import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { Box, NullIterator, Product } from "./index.ts";

describe("composite with iterator pattern", () => {
  /**
   * The logic is an example of a pre-order traversal algorithm. Calling `.netPrice()` immediately recurses into nested children before
   * moving onto the next sibling. This is a defining characteristic of the depth first search traversal algorithm.
   */
  describe("depth first search traversal algorithm", () => {
    test("successfully calculates the total price of a Box containing a single Product", () => {
      const box = new Box("box");
      box.append(new Product("product"));

      const totalNetPrice = box.netPrice();

      assert.strictEqual(totalNetPrice, 20);
    });

    test("successfully calculates the total price of a Box containing many Boxes", () => {
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

      const bigBox = new Box("big box");
      const mediumBox = new Box("medium box");
      const smallBox = new Box("small box");

      const product = new Product("product one");
      const product2 = new Product("product two");
      const product3 = new Product("product three");
      const product4 = new Product("product four");

      smallBox.append(product);
      smallBox.append(product2);
      mediumBox.append(smallBox);
      bigBox.append(mediumBox);
      bigBox.append(product3);
      bigBox.append(product4);

      const totalNetPrice = bigBox.netPrice();

      assert.strictEqual(totalNetPrice, 80);
    });

    test("Product should have a null iterator", () => {
      const product = new Product("product");
      assert.strictEqual(product.getIterator() instanceof NullIterator, true);
    });
  });

  describe("breadth first search traversal algorithm", () => {
    test("successfully calculates the total price of a Box containing a single Product", () => {
      const box = new Box("box", "breadth-first-search");
      box.append(new Product("product"));

      const totalNetPrice = box.netPrice();

      assert.strictEqual(totalNetPrice, 20);
    });

    test("successfully calculates the total price of a Box containing many Boxes", () => {
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

      const bigBox = new Box("big box", "breadth-first-search");
      const mediumBox = new Box("medium box", "breadth-first-search");
      const smallBox = new Box("small box", "breadth-first-search");

      const product = new Product("small box product one");
      const product2 = new Product("small box product two");
      const product3 = new Product("big box product one");
      const product4 = new Product("big box product two");

      smallBox.append(product);
      smallBox.append(product2);
      mediumBox.append(smallBox);
      bigBox.append(mediumBox);
      bigBox.append(product3);
      bigBox.append(product4);

      const totalNetPrice = bigBox.netPrice();

      assert.strictEqual(totalNetPrice, 80);
    });

    test("algorithm is broken because it uses recursion", () => {
      /**
       * Structure being tested:
       *
       *  📦 Big Box
       *  ├── 📦 Medium Box
       *  │   ├── 🏷️ Product ($20)
       *  │   └── 🏷️ Product ($20)
       *  ├── 🏷️ Product ($20)
       *  └── 🏷️ Product ($20)
       *
       */

      const bigBox = new Box("big box", "breadth-first-search");
      const mediumBox = new Box("medium box", "breadth-first-search");

      const product = new Product("small box product one");
      const product2 = new Product("small box product two");
      const product3 = new Product("big box product one");
      const product4 = new Product("big box product two");

      mediumBox.append(product);
      mediumBox.append(product2);
      bigBox.append(mediumBox);
      bigBox.append(product3);
      bigBox.append(product4);

      const totalNetPrice =
        bigBox.netPriceWithBrokenBreadthFirstSearchTraversal();

      /**
       * We get 120 because we double handle the "nodes". This is how the traversal works:
       * 1. We add the big box's children (medium box and product3 and product4) to the queue.
       * 2. We add the cost of product 3 to the total cost.
       * 3. We add the cost of product 4 to the total cost.
       * ===> Total cost: $20 + $20 = $40.
       * 4. We add the children of the medium box to the queue of the big box BFS iterator.
       * 5. We create a new BFS iterator for the medium box.
       * 6. We add the children of the medium box to the queue of the medium box BFS iterator.
       * 7. We add the cost of product 1 to the total cost.
       * 8. We add the cost of product 2 to the total cost.
       * ===> Total cost: $40 + $20 + $20 = $80.
       * Again, in scope of the big box BFS iterator, we add the cost of the medium box children to the total cost.
       * We add the cost of product 1 to the total cost.
       * We add the cost of product 2 to the total cost.
       * ===> Total cost: $80 + $20 + $20 = $120.
       *
       * Obvious is the double handling of the leaf Product nodes. This becomes worse the deeper the recursion goes because
       * with each new level we create a new BFS iterator.
       */
      assert.strictEqual(totalNetPrice, 120);
    });
  });
});
