# Composite With Iterator Pattern

## Overview

The Composite class holds collections of other objects. It must manage access to its children—and all children nested recursively below. This access is expressed as traversal logic. When this logic becomes complex, it can distract from the Composite's core responsibility.

The solution: combine the Composite pattern with the Iterator pattern. Let an Iterator handle the traversal, keeping the Composite class focused on its primary job.

## When to Use

- When the traversal algorithm is complex or likely to vary (e.g., switching between list traversal, depth-first search, or breadth-first search). The principle at work is to encapsulate the concept most likely to vary. For us, this is the mechanism of traversal.
- When you want to swap traversal strategies without modifying the Composite class.

## Structure

### Class Diagram

```ascii
┌─────────────────────────────────┐      ┌──────────────────────────────┐
│    <<abstract>> Component       │      │   <<interface>> Aggregate    │
├─────────────────────────────────┤      ├──────────────────────────────┤
│ + getBox(): Box | 0             │      │ + getIterator(): Iterator    │
│ + getChild(index): Component    │      │ + append(item): void         │
│ + getIterator(): Iterator       │      │ + append(item): void         │
│ + netPrice(): number {abstract} │      │                              │
└─────────────────────────────────┘      └──────────────────────────────┘
              △                                       △
              │ extends                               │ implements
    ┌─────────┴─────────┐                             │
    │                   │                             │
┌───┴───────────────────┴─────────────────────────────┴───┐
│                        Box                              │
│                 (Composite + Aggregate)                 │
├─────────────────────────────────────────────────────────┤
│ - children: Component[]                                 │
├─────────────────────────────────────────────────────────┤
│ + getBox(): this                                        │
│ + getChild(index): Component                            │
│ + append(component): void                               │
│ + remove(component): void                               │
│ + getItems(): Component[]                               │
│ + getCount(): number                                    │
│ + getIterator(): Iterator                               │
│ + netPrice(): number                                    │
└─────────────────────────────────────────────────────────┘
         ◇                            ◆
         │ contains                   │ creates
         ▼                            ▼
   Component[]              ┌──────────────────────────────┐
                            │       ListIterator           │
┌───────────────────┐       ├──────────────────────────────┤
│     Product       │       │ - current: number            │
│    (Primitive)    │       │ - collection: Box            │
├───────────────────┤       ├──────────────────────────────┤
│ + netPrice()      │       │ + first(): Component         │
└───────────────────┘       │ + next(): Component          │
        △                   │ + isDone(): boolean          │
        │ extends           │ + currentItem(): Component   │
        │                   └──────────────────────────────┘
┌───────┴─────────────────┐               △
│   <<abstract>> Component │               │ implements
└─────────────────────────┘               │
                            ┌─────────────┴────────────────┐
                            │    <<interface>> Iterator    │
                            ├──────────────────────────────┤
                            │ + first(): unknown           │
                            │ + next(): unknown            │
                            │ + isDone(): boolean          │
                            │ + currentItem(): unknown     │
                            └──────────────────────────────┘
                                          △
                                          │ implements
                            ┌─────────────┴────────────────┐
                            │        NullIterator          │
                            ├──────────────────────────────┤
                            │ + first(): void              │
                            │ + next(): void               │
                            │ + isDone(): true             │
                            │ + currentItem(): void        │
                            └──────────────────────────────┘
```

### Conceptual Object Structure

When a Box calculates its `netPrice`, it delegates traversal to an Iterator. The Iterator walks through children while the Box aggregates results. Each Box creates its own iterator, enabling independent nested traversals. MENTION THAT I MAKE USE OF A BFS AND DFS TRAVERSAL ALGORITHM BECAUSE THE STRUCTURE WE PRODUCE IS GRAPH LIKE, THIS IS A CHARACTERISTIC OF COMPOSITE PATTERNS.

```ascii
                    ┌─────────────────────────────────────┐
                    │               Box                   │
                    │  ┌─────────┬─────────┬─────────┐    │
                    │  │ Product │   Box   │ Product │    │──────┐
                    │  │  ($20)  │         │  ($20)  │    │      │
                    │  └─────────┴────┬────┴─────────┘    │      │
                    └─────────────────┼───────────────────┘      │
                                      │                          │
                              ┌───────┴───────┐            ┌─────▼─────────────┐
                              ▼               ▼            │   ListIterator    │
                         ┌─────────┐     ┌─────────┐       │   current: 0      │
                         │ Product │     │ Product │       │   collection: Box │
                         │  ($20)  │     │  ($20)  │       └───────────────────┘
                         └─────────┘     └─────────┘

    Box.netPrice() Execution:
    ┌──────────────────────────────────────────────────────────────────────┐
    │  1. Box creates ListIterator                                         │
    │  2. iterator.first() → current = 0                                   │
    │  3. Loop: while !iterator.isDone()                                   │
    │     │  ├─ iterator.currentItem() → Product ($20)                     │
    │     │  ├─ totalNetPrice += 20                                        │
    │     │  └─ iterator.next() → current++                                │
    │  4. Returns totalNetPrice = 80 (sum of all nested Products)          │
    └──────────────────────────────────────────────────────────────────────┘

Legend:
  Box          = Composite (container, implements both Component and Aggregate)
  Product      = Primitive (leaf, no children)
  ListIterator = Concrete Iterator (traverses Box's children)
  NullIterator = Null Object (used when no traversal is needed)
```

_This combines the Composite pattern structure with the Iterator pattern for traversal._

## Implementation

The key insight: the Composite class becomes the Aggregate class. The [Box from the Composite pattern](./README-composite.md) now also implements the [Aggregate interface from the Iterator pattern](../../behavioural/iterator/README-iterator.md). It holds the collection and provides an iterator for traversal.

### Example: Calculating Net Price

A Box may contain Products (with a fixed price of $20) or other Boxes. To calculate the total price, we must traverse all children recursively and sum up the Product prices. Rather than embedding traversal logic directly in the Box class, we delegate it to an Iterator—and delegate price computation to sub-elements. This gives us flexibility to change traversal strategies later.

First, we extend the Component interface with a `netPrice` method:

```typescript
abstract class Component {
  ...,

  public abstract netPrice(): number;
}
```

### Box as Composite + Aggregate

Next, we update the concrete Composite class, Box, to match the Aggregate interface. The design decision prioritises safety over transparency, as outlined in the [Composite pattern](./README-composite.md)—child management methods (`append`, `remove`) are defined where they are meaningful. We rename `add` to `append` to match the Aggregate interface and add a `getIterator` method.

```typescript
class Box extends Component implements Aggregate {
  protected children: Array<Component> = [];

  // ... Composite methods ...

  public append(component: Component) {}

  public remove(component: Component) {}

  public getIterator(): Iterator {}

  public netPrice() {}
}
```

### Using the Iterator Internally

In the standard Iterator pattern, `getIterator` exposes an external iterator for clients. However, exposing the iterator here feels leaky—we only use it internally within the Composite/Aggregate class to calculate `netPrice`. Although not strictly an internal iterator, the Box class creates and consumes its own iterator through the `netPrice` method. This keeps traversal logic encapsulated within the Box[^1]:

```typescript
class Box extends Component implements Aggregate {
  protected children: Array<Component> = [];

  // ... Composite methods ...

  public append(component: Component) {}

  public remove(component: Component) {}

  public getIterator(): Iterator {
    return new ListIterator(this);
  }

  public netPrice() {
    const iterator = this.getIterator();

    let totalNetPrice = 0;

    for (iterator.first(); !iterator.isDone(); iterator.next()) {
      const nextItem = iterator.currentItem();
      totalNetPrice += nextItem.netPrice();
    }

    delete iterator;
    return totalNetPrice;
  }
}
```

### Default Iterator: The NullIterator

To maximise the Component interface, we provide a default `getIterator` implementation. The Product class inherits a `NullIterator`—an iterator that's always done. The Box class overrides this to return a real `ListIterator`. Because the iterator deals with accessing children, defining this method on the Component interface is consistent with the design decision we made when constructing the Composite pattern: prioritise maximising the component interface and client transparency for safe operations. There is some tension here that needs to be resolved, see the TODO list.

```typescript
abstract class Component {
  public getBox(): Box | 0 {
    return 0;
  }

  public getChild(index: number): Component | void {
    return;
  }

  public getIterator(): Iterator {
    return new NullIterator();
  }

  public abstract netPrice(): number;
}
```

## Key Principles

- **The Composite becomes the Aggregate**: The container class (Box) implements both Component and Aggregate interfaces.
- **Traversal is encapsulated**: The Iterator handles how children are visited; the Composite handles what to do with them.
- **NullIterator for primitives**: Leaf nodes return a NullIterator, maintaining interface uniformity without special-case logic.

## TODO

- [ ] Add TS generic support
- [ ] Resolve tension in base classes. Component defines `getIterator`, but so does the Aggregate class. Component should implement Aggregate, but there are methods for managing children that we only want to declare on the class that they are meaningful: the concrete Composite class.
- [ ] Mention how I had to use an iterator that made sense for the data structure we were using. We are using a graph and therefore it is silly to use a list collection and better to use a traversal algorithm that makes use of the graph model.
- [ ] What is the difference in recursive and iterative DFS?

there is a lot going on here. a lot of things that I learnt. for the specific data structure I was using I was wrongly trying to use a flat collection
like an array and support traversal of a data structure that resembled a graph.. I should of thought about what sort of data structure I had because this is coupled to the Iterator and I would have realised that using a list collection iterator instead of a graph collection iterator did not make sense whatsoever.

// https://www.codecademy.com/article/breadth-first-search-bfs-algorithm

from this I will also notice that the implementation for getting the total price in the collection or aggregate did not need to change.. the traversal algorithm
has changed but we, or the aggregate does not care about how the iterator is performing its traversal.. all it cares about is that we can walk the nodes and intermediate process the results for obtaining the total price of elements below a given composite Box. so, the body logic of "add to total if the element has a price" is appropriate in scope of this class.. the iterator is walking the data structure.. its responsibility is not to call methods on the elements it is walking. good separation of concerns is at play.

## References

[^1]: Design Patterns: Elements of Reusable Object-Oriented Software, page 171.
