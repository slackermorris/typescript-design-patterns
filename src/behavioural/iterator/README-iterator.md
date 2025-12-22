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
┌─────────────────────────────────┐
│      <<abstract>> Component     │
├─────────────────────────────────┤
│ + getBox(): Box | 0             │
│ + getChild(index): Component    │
│ + operation(): string {abstract}│
└─────────────────────────────────┘
              △
              │
    ┌─────────┴─────────┐
    │                   │
┌───┴───────────────┐  ┌┴──────────────┐
│       Box         │  │    Product    │
│    (Composite)    │  │   (Primitive) │
├───────────────────┤  ├───────────────┤
│ - children: []    │  │               │
├───────────────────┤  ├───────────────┤
│ + getBox(): this  │  │ + operation() │
│ + getChild(i)     │  └───────────────┘
│ + add(component)  │
│ + remove(component)│
│ + operation()     │
└───────────────────┘
        ◇
        │ contains
        ▼
   Component[]
```

### Conceptual Object Structure

Imagine we have two types of objects: Products and Boxes. A Box can contain several Products as well as a number of smaller Boxes. These little Boxes can also hold some Products or even smaller Boxes, and so on. It is worth noting that a Box delegates most of its work to its sub-elements, passing any request it receives recursively to all its children which it then processes the intermediate results of.

```
                    ┌─────────┐
                    │   Box   │
                    └────┬────┘
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     ┌─────────┐    ┌─────────┐    ┌─────────┐
     │ Product │    │   Box   │    │ Product │
     └─────────┘    └────┬────┘    └─────────┘
                   ┌─────┴─────┐
                   ▼           ▼
              ┌─────────┐ ┌─────────┐
              │ Product │ │   Box   │
              └─────────┘ └────┬────┘
                               │
                               ▼
                          ┌─────────┐
                          │ Product │
                          └─────────┘

Legend:
  Box     = Composite (can contain children)
  Product = Leaf (no children)
```

_This scenario is adapted from [Refactoring Guru's Composite Pattern](https://refactoring.guru/design-patterns/composite)._

## Implementation

## Key Principles

- **Component classes can usually provide default implementations** of the common operations.

## TODO

- [ ] 

## References

[^1]: [Refactoring Guru Iterator Pattern](https://refactoring.guru/design-patterns/iterator).
