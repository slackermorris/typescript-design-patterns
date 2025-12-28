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
                            │       GraphIterator          │
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
│  <<abstract>> Component │               │ implements
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

When a Box calculates its `netPrice`, it delegates traversal to an Iterator. The Iterator walks through children while the Box aggregates results. Because the collection takes the form of a graph (Products in Boxes inside possible Boxes) the mechanism of traversal needs to support a graph-like data structure. This is why I implement both of a depth first search (DFS) and breadth first search (BFS) algorithm.

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
                              ▼               ▼            │   BFSIterator     │
                         ┌─────────┐     ┌─────────┐       │   current: 0      │
                         │ Product │     │ Product │       │   collection: Box │
                         │  ($20)  │     │  ($20)  │       └───────────────────┘
                         └─────────┘     └─────────┘

    Box.netPrice() Execution:
    ┌──────────────────────────────────────────────────────────────────────┐
    │  1. Box creates BFSIterator                                          │
    │  2. iterator.first() → first indexed element in graph                │
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

In the standard Iterator pattern, `getIterator` exposes an external iterator for clients. However, exposing the iterator here feels leaky—we only use it internally within the Composite/Aggregate class to calculate `netPrice`. Although not strictly an internal iterator, the Box class creates and consumes its own iterator through the `netPrice` method. This keeps traversal logic encapsulated within the Box[^1]:

```typescript
class Box extends Component implements Aggregate {
  protected children: Array<Component> = [];

  // ... Composite methods ...

  public append(component: Component) {}

  public remove(component: Component) {}

  public getIterator(): Iterator {
    return new LazyBreadthFirstSearchIterator(this);
  }

  public netPrice() {
    const iterator = this.getIterator();

    let totalNetPrice = 0;

    for (iterator.first(); !iterator.isDone(); iterator.next()) {
      const nextItem = iterator.currentItem() as Component;

      if (!Boolean(nextItem.getBox())) {
        totalNetPrice += nextItem.netPrice();
      }
    }

    delete iterator;

    return totalNetPrice;
  }
}
```

It is important to highlight that in calculating the total price of items it contains, a Box is completely ignorant of how we are walking through the collection. Its sole responsibility is to aggregate the result as we walk through the collection. When writing code like this, it is important to consider whether the context or scope should be aware of internal details of X.

What do I mean by this? Well, in computing the total price we call this piece of code:

```typescript
totalNetPrice += nextItem.netPrice();
```

Should a Box be aware that it has elements in it that have a `netPrice` method? Yes, definitely. It itself is of the same shared class. It makes sense that the Box is aware that elements in its scope have this method exposed. Alternatively, would it make sense for the Iterator to calculate this cost? No, not at all. The Iterator should remain ignorant of the identity of the elements it is handling. Its job is to offer a mechanism to traverse them. If the Iterator handled this logic we would be leaking details of the collections contents, thereby ruining a clean separation of concerns and overall abstraction.

### Default Iterator: The NullIterator

To maximise the Component interface, we provide a default `getIterator` implementation. The Product class inherits a `NullIterator`—an iterator that's always done. The Box class overrides this to return a real `LazyBreadthFirstSearchIterator`. Because the iterator deals with accessing children, defining this method on the Component interface is consistent with the design decision we made when constructing the Composite pattern: prioritise maximising the component interface and client transparency for safe operations.

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

However, there is some tension between the patterns (Composite, Iterator) root interfaces. Here we have defined the `getIterator` method on the Composite base class. But this is a method already defined on the base Iterator > Aggregate interface. Ideally, the base Composite class would extend or implement the base Iterator interface. But this would require it to include the other methods defined on the Iterator > Aggregate interface, `append` and `remove`, the two child management methods that I explicitly chose not to include on the Composite > Component interface because they are better defined on the composite concrete class where they are meaningfully used: a design decision I have explained elsewhere.

I feel a little strange redefining the `getIterator` method on the Composite class when it really comes from the Iterator interface.

## Key Principles

- **The Composite becomes the Aggregate**: The container class (Box) implements both Component and Aggregate interfaces.
- **Traversal is encapsulated**: The Iterator handles how children are visited; the Composite handles what to do with them.
- **NullIterator for primitives**: Leaf nodes return a NullIterator, maintaining interface uniformity without special-case logic.

## TODO

- [ ] Add TS generic support
- [ ] Mention how I had to use an iterator that made sense for the data structure we were using. We are using a graph and therefore it is silly to use a list collection and better to use a traversal algorithm that makes use of the graph model.
- [ ] Implement everything from scratch again.
- [ ] How coupled is the Iterator to receiving a nested array?

## References

[^1]: Design Patterns: Elements of Reusable Object-Oriented Software, page 171.
