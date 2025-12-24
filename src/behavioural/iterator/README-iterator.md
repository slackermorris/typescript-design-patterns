# Iterator Pattern

## Overview

The Iterator Pattern is useful for traversing elements of a collections (stacks, lists, trees) without exposing the underlying representation when you want to keep separation between the algorithim you are using to traverse and the underlying data structure being traversed. Iterators can encapsulate bulky traversal algorithims neither requiring the client to write them and include them in its business logic or have the collection itself declare these members on it.

It allows iteration over the same collection to happen in parallel because the iterator is isolated and contains its own iteration state. take responsibility for access and traversal out of the list object and put it into an iterator. this allows us to define iterators for different traversal policies without enumerating them all on the List interface ^[1].

The Iterator pattern captures these techniques for supporting access and traversal over object structures. It is applicable to composite structures and collections as well. It abstracts the traversal algorithm and shields clients from the internal structure of the objects they traverse. This illustrates how encapsulating the concept that varies helps us gain flexibility and reusability.


## When to Use

- When the collection you are working with has a complex data structure under the hood and you want to hide its complexity from clients. This approach protects the collection from careless or malicious actions which the client would be able to perform on the collection directly ^[1].
- When you want to support variations of traversal behaviour (algorithms) of the aggregate.

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

The iterator only has access to the data structure, the collection, through methods exposed by the collection class. See an example in how we isolate the current item.

For this example we have implemeted an _external_ iterator where control of the iteration is managed by the client, in our case the tests.

We define the traversal algorithim inside the concrete class iterator. The iterator stores the state of the iteration. Could the aggregate define the traversal algorithim? Yes. If it is defined in the Iterator then we will need a different Iterator for each algorithim we want. If the traversal algorithim needs to access private variables on the Aggregate then this will break encapsulation of the Aggregate. We sort of do this when we tap the `.getItems` call. 

The Iterator concrete class keeps the concrete class state it is working on, the collection, in state so that it may interact with it for its traversal but importantly it does not have real access to the underlying data structure like, or maybe it does but it really shouldn't so maybe I need to look into this.

because the concrete implementation of the aggregate handles the collection, it makes sense to declare member functions we expect as part of the Aggregate interface like append and remove. 

the iterator and the aggregate are tightly coupled. 

the iterator stores the Aggregate or Collection it was created from. 




Implement concrete iterator classes for the collections that you want to be traversable with iterators. An iterator object must be linked with a single collection instance. Usually, this link is established via the iterator’s constructor.

Implement the collection interface in your collection classes. The main idea is to provide the client with a shortcut for creating iterators, tailored for a particular collection class. The collection object must pass itself to the iterator’s constructor to establish a link between them.

Go over the client code to replace all of the collection traversal code with the use of iterators. The client fetches a new iterator object each time it needs to iterate over the collection elements.


## Key Principles

- **Component classes can usually provide default implementations** of the common operations.
- **Iterators make it easy to change the traversal algorithim used by an aggregate (data structure)** by simply replacing the iterator instance used.
- **An Interators traversal interface removes the need to declare an equivalent interface on the Aggregate**.

## TODO

- [ ] The current variable for the Iterator should be typed as an index of an Array.
- [ ] In ListIterator.next, check that the current position does not exceed the length of the collection.
- [ ] Implement an Iterator that does Depth First Search or Breadth First Search instead of just iterating over a list. 
- [ ] Update the composite pattern to use an Iterator. Think about using NullIterators. 
- [ ] Give an illustration of the flexibility of the pattern. Define another iterator. 

## References

[^1]: Design Patterns: Elements of Reusable Object-Oriented Software, page 257.
[^2]: [Refactoring Guru Iterator Pattern](https://refactoring.guru/design-patterns/iterator).
