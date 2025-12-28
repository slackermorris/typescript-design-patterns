# Iterator Pattern

## Overview

The Iterator Pattern provides a way to traverse elements of a collection (stacks, lists, trees) without exposing the underlying representation. It keeps a clean separation between the traversal algorithm and the data structure being traversed.

Iterators encapsulate traversal logic that would otherwise clutter client code or bloat the collection class itself. Because each iterator maintains its own traversal state, multiple iterators can traverse the same collection in parallel—each tracking its own position independently[^1].

The pattern abstracts the traversal algorithm and shields clients from the internal structure of the objects they traverse. This illustrates how encapsulating the concept that varies—here, the mechanism of traversal—helps us gain flexibility and reusability.

## When to Use

- When the collection you are working with has a complex data structure under the hood and you want to hide its complexity from clients. This protects the collection from careless or malicious actions that could occur if the client had direct access[^1].
- When you want to support variations of traversal behaviour (algorithms) without enumerating them all on the collection interface.

## Structure

### Class Diagram

```ascii
┌──────────────────────────────┐      ┌─────────────────────────────────┐
│    <<interface>> Iterator<T> │      │   <<abstract>> Aggregate<T>     │
├──────────────────────────────┤      ├─────────────────────────────────┤
│ + first(): T                 │      │ + getIterator(): Iterator<T>    │
│ + next(): T                  │      │ + append(item: T): void         │
│ + isDone(): boolean          │      │ + remove(item: T): void         │
│ + currentItem(): T           │      └─────────────────────────────────┘
└──────────────────────────────┘                      △
              △                                       │
              │ implements                            │ extends
              │                                       │
┌─────────────┴────────────────┐      ┌───────────────┴─────────────────┐
│       ListIterator<T>        │      │            List<T>              │
├──────────────────────────────┤      ├─────────────────────────────────┤
│ - current: number            │◆────▶│ - items: Array<T>               │
│ - collection: List<T>        │      ├─────────────────────────────────┤
├──────────────────────────────┤      │ + append(item: T): void         │
│ + first(): T                 │      │ + remove(item: T): void         │
│ + next(): T                  │      │ + getItems(): Array<T>          │
│ + isDone(): boolean          │      │ + getCount(): number            │
│ + currentItem(): T           │      │ + getIterator(): Iterator<T>    │
└──────────────────────────────┘      └─────────────────────────────────┘
```

### Conceptual Object Structure

The Iterator pattern separates the traversal logic from the collection itself. The `Aggregate` (our `List`) holds the data, while the `Iterator` (our `ListIterator`) maintains the traversal state. This allows multiple iterators to traverse the same collection independently.

```ascii
                      ┌──────────────────────────────┐
                      │          List<T>             │
                      │  ┌───┬───┬───┬───┬───┬───┐   │
                      │  │ A │ B │ C │ D │ E │ F │   │
                      │  └───┴───┴───┴───┴───┴───┘   │
                      │    0   1   2   3   4   5     │
                      └──────────────────────────────┘
                                    ▲
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
    ┌─────────┴─────────┐ ┌─────────┴─────────┐ ┌─────────┴─────────┐
    │  ListIterator #1  │ │  ListIterator #2  │ │  ListIterator #3  │
    │   current: 0      │ │   current: 2      │ │   current: 5      │
    │   item: "A"       │ │   item: "C"       │ │   item: "F"       │
    │   isDone: false   │ │   isDone: false   │ │   isDone: true    │
    └───────────────────┘ └───────────────────┘ └───────────────────┘
            │                     │                       │
            ▼                     ▼                       ▼
         first()              next()                  isDone()
         next()            currentItem()
      currentItem()

Legend:
  List         = Concrete Aggregate (holds the collection)
  ListIterator = Concrete Iterator (maintains traversal state)
```

_This scenario is adapted from [Refactoring Guru's Iterator Pattern](https://refactoring.guru/design-patterns/iterator)._

## Implementation

The implementation involves two main abstractions: the Aggregate (the collection) and the Iterator (the traversal mechanism). The iterator accesses the collection only through methods exposed by the aggregate class, maintaining proper encapsulation.

### The Aggregate Interface

The Aggregate class defines the contract for collections that can be iterated. It declares methods for managing collection elements and for creating an iterator:

```typescript
export abstract class Aggregate<T> {
  public abstract getIterator(): Iterator<T>;

  public abstract append(item: T): void;

  public abstract remove(item: T): void;
}
```

Because the concrete implementation of the aggregate handles the collection, it makes sense to declare member functions like `append` and `remove` as part of the Aggregate interface.

### The Iterator Interface

The Iterator interface defines the traversal operations. This implementation uses an _external_ iterator where control of the iteration is managed by the client:

```typescript
export interface Iterator<T> {
  first(): T;
  next(): T;
  isDone(): boolean;
  currentItem(): T;
}
```

### The Concrete Aggregate: List

The `List` class implements the Aggregate interface, providing storage for items and a factory method for creating iterators:

```typescript
export class List<T> extends Aggregate<T> {
  protected items: Array<T> = [];

  public append(item: T) {
    this.items.push(item);
  }

  public remove(item: T) {
    this.items.splice(this.items.indexOf(item), 1);
  }

  public getItems(): Array<T> {
    return this.items;
  }

  public getCount() {
    return this.items.length;
  }

  public getIterator(): Iterator<T> {
    return new ListIterator(this);
  }
}
```

The `getIterator` method passes `this` to the iterator's constructor, establishing the link between the iterator and its collection.

### The Concrete Iterator: ListIterator

The `ListIterator` maintains its own traversal state via the `current` index. It stores a reference to the collection but accesses elements only through the collection's public interface:

```typescript
export class ListIterator<T> implements Iterator<T> {
  private current: number;
  protected collection: List<T>;

  public constructor(collection: List<T>) {
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

    if (this.current == 0 && collectionCount == 0) {
      return false;
    }

    if (this.current >= collectionCount) {
      return true;
    }
    return false;
  }
}
```

### Where to Define the Traversal Algorithm

The traversal algorithm is defined inside the concrete Iterator class. This design choice has implications:

- **If defined in the Iterator**: Each new traversal strategy requires a new Iterator class. This provides flexibility—clients can easily swap iterators without modifying the aggregate.
- **If defined in the Aggregate**: The aggregate controls traversal, but this may require exposing private variables, breaking encapsulation.

The iterator and the aggregate are tightly coupled—the iterator must understand the aggregate's structure to traverse it. However, the client remains decoupled from both, interacting only through the Iterator interface.

### Client Usage

The client fetches a new iterator object each time it needs to traverse the collection:

```typescript
const list = new List<string>();
list.append("A");
list.append("B");
list.append("C");

const iterator = list.getIterator();

for (iterator.first(); !iterator.isDone(); iterator.next()) {
  console.log(iterator.currentItem());
}
// Output: A, B, C
```

## Key Principles

- **Aggregates provide default iterator implementations**: The collection class creates iterators tailored to its structure via `getIterator()`.
- **Iterators make traversal algorithms interchangeable**: Simply replace the iterator instance to change how a collection is traversed.
- **An Iterator's traversal interface removes the need for equivalent methods on the Aggregate**: The collection doesn't need to expose traversal logic—that's the iterator's job.

## TODO

- [ ] The `current` variable for the Iterator should be typed as an index of an Array.
- [ ] In `ListIterator.next`, check that the current position does not exceed the length of the collection.

## References

[^1]: Design Patterns: Elements of Reusable Object-Oriented Software, page 257.
[^2]: [Refactoring Guru Iterator Pattern](https://refactoring.guru/design-patterns/iterator).
