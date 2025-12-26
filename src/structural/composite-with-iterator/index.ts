export abstract class Component {
  public getBox(): Box | 0 {
    return 0;
  }

  public getChild(index: number): Component | void {
    return;
  }

  public getIterator(): Iterator {
    return new NullIterator();
  }

  public abstract getName();

  public abstract netPrice(): number;
}

export interface Aggregate {
  getIterator(): Iterator;

  append(item: unknown): void;

  remove(item: unknown): void;
}

export interface Iterator {
  /**
   * Positions the iterator to the first element by setting the current element as the first element in the collection.
   */
  first(): unknown;

  /**
   * Advance the current element to the next element.
   */
  next(): unknown;

  /**
   * Test whether we have advanced beyond the last element and so finished the traversal.
   */
  isDone(): boolean;

  /**
   * Return the current element in the collection.
   */
  currentItem(): unknown;
}

/**
 * A concrete class that implements the interfaces of both the Composite (Component) and Iterator (Aggregate) class patterns.
 */
export class Box extends Component implements Aggregate {
  private name: string;
  protected children: Array<Component> = [];
  protected iteratorType: "breadth-first-search" | "depth-first-search" =
    "depth-first-search";

  constructor(
    name,
    iteratorType:
      | "breadth-first-search"
      | "depth-first-search" = "depth-first-search"
  ) {
    super();
    this.name = name;
    this.iteratorType = iteratorType;
  }

  public getBox() {
    return this;
  }

  public getChild(index: number) {
    return this.children[index];
  }

  public append(component: Component) {
    this.children.push(component);
  }

  public remove(component: Component) {
    const componentIndex = this.children.indexOf(component);
    if (componentIndex == -1) {
      return;
    }

    this.children.splice(componentIndex, 1);
  }

  public getItems() {
    return this.children;
  }

  public getCount() {
    return this.children.length;
  }

  public getIterator(): Iterator {
    return this.iteratorType === "breadth-first-search"
      ? new LazyBreadthFirstSearchIterator(this)
      : new ListIterator(this);
  }

  public getName() {
    return this.name;
  }

  public netPrice() {
    const iterator = this.getIterator();

    let totalNetPrice = 0;

    for (iterator.first(); !iterator.isDone(); iterator.next()) {
      const nextItem = iterator.currentItem() as Component;

      if (this.iteratorType === "breadth-first-search") {
        // For BFS: avoid recursion and just iterate over queue only count prices from leaf nodes (Products), not containers (Boxes)
        if (nextItem.getBox() === 0) {
          totalNetPrice += nextItem.netPrice();
        }
      } else {
        // For DFS: recursively add prices (the ListIterator only iterates direct children)
        totalNetPrice += nextItem.netPrice();
      }
    }

    // [ ] Be sure to clean up and delete the iterator.
    // delete iterator;

    return totalNetPrice;
  }
}

/**
 * A concrete class that inherits from the Component base class used in the Composite pattern.
 */
export class Product extends Component {
  private name: string;

  constructor(name) {
    super();
    this.name = name;
  }
  public getName() {
    return this.name;
  }
  public netPrice() {
    return 20;
  }
}

/**
 * A concrete class that defines an Iterator algorithm.
 */
export class ListIterator implements Iterator {
  private current: number;
  protected collection: Box;

  public constructor(collection: Box) {
    this.current = 0;
    this.collection = collection;
  }

  public first() {
    this.current = 0;
    return this.collection.getItems()[this.current];
  }

  public next() {
    this.current++;
    return this.collection.getItems()[this.current];
  }

  public currentItem() {
    if (this.isDone()) {
      throw new IteratorOutOfBoundsError();
    }
    return this.collection.getItems()[this.current];
  }

  public isDone() {
    const collectionCount = this.collection.getCount();

    // There is nothing in the collection. We have not finished iterating.
    if (this.current == 0 && collectionCount == 0) {
      return false;
    }

    if (this.current >= collectionCount) {
      return true;
    }
    return false;
  }
}

/**
 * A concrete class that defines a Breadth-First Search Iterator algorithm.
 * Flattens the composite tree and traverses level by level.
 */
export class LazyBreadthFirstSearchIterator implements Iterator {
  protected collection: Box;
  private fifoQueue: Array<Component>;

  // https://www.codecademy.com/article/breadth-first-search-bfs-algorithm

  public constructor(collection: Box) {
    this.collection = collection;

    this.buildQueue();
  }

  private buildQueue() {
    this.fifoQueue = [...this.collection.getItems()];
  }

  public first() {
    this.buildQueue();
    return this.fifoQueue[0];
  }

  public next() {
    const nextElement = this.fifoQueue.shift();

    if (nextElement != null) {
      const nextElementAsBox = nextElement.getBox();
      if (nextElementAsBox != 0) {
        this.fifoQueue.push(...nextElementAsBox.getItems());
      }

      return nextElement;
    }

    return;
  }

  public currentItem() {
    return this.fifoQueue[0];
  }

  public isDone() {
    return this.fifoQueue.length === 0;
  }
}

export class IteratorOutOfBoundsError extends Error {
  constructor(message = "The iteration has already terminated") {
    super(message);
    this.name = "IteratorOutOfBoundsError";
  }
}

export class NullIterator implements Iterator {
  public first() {
    return;
  }

  public next() {
    return;
  }

  public currentItem() {
    return;
  }

  public isDone() {
    return true;
  }
}
