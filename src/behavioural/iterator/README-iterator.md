# Iterator Pattern

## Overview

The Iterator Pattern is used

extract bulky traversal algorithims from the client, business logic.

can iterate over same collection in parallel because the iterator object contains its own iteration state.

Intent: Lets you traverse elements of a collection without exposing its underlying representation (list, stack, tree, etc.).

pg 257
take responsibility for access and traversal out of the list object and put it into an iterator. this allows us to define iterators for different traversal policies without enumerating them all on the List interface.

not entirely sure what I am trying to do here. I think i should implement an iterator for a basic list.

## When to Use

- When the collection you are working with has a complex data structure under the hood and you want to hide its complexity from clients. This approach protects the collection from careless or malicious actions which the client would be able to perform on the collection directly ^[1].

## Structure

### Class Diagram

```
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

The data structure is encapsulated in the concrete Aggregate class. In our case this is the List class which supports an Array collection.

The iterator only has access to the data structure, the collection, through methods exposed by the collection class. See an example in how we isolate the current item.

For this example we have implemeted an _external_ iterator where control of the iteration is managed by the client, in our case the tests.

We define the traversal algorithim inside the concrete class iterator. The iterator stores the state of the iteration. Could the aggregate define the traversal algorithim? Yes. If it is defined in the Iterator then we will need a different Iterator for each algorithim we want. If the traversal algorithim needs to access private variables on the Aggregate then this will break encapsulation of the Aggregate. We sort of do this when we tap the `.getItems` call. 

The Iterator concrete class keeps the concrete class state it is working on, the collection, in state so that it may interact with it for its traversal but importantly it does not have real access to the underlying data structure like, or maybe it does but it really shouldn't so maybe I need to look into this.

the iterator and the aggregate are tightly coupled. 

the iterator stores the Aggregate or Collection it was created from. 

## Key Principles

- **Component classes can usually provide default implementations** of the common operations.
- **Iterators make it easy to change the traversal algorithim used by an aggregate (data structure)** by simply replacing the iterator instance used.
- **An Interators traversal interface removes the need to declare an equivalent interface on the Aggregate**.

## TODO

- [ ] The current variable for the Iterator should be typed as an index of an Array.
- [ ] In ListIterator.next, check that the current position does not exceed the length of the collection.
- [ ] Implement an Iterator that does Depth First Search or Breadth First Search instead of just iterating over a list. 
- [ ] Update the composite pattern to use an Iterator. Think about using NullIterators. 

## References

[^1]: [Refactoring Guru Iterator Pattern](https://refactoring.guru/design-patterns/iterator).
