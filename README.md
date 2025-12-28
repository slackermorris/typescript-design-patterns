# 🎨 TypeScript Design Patterns

A practical exploration of Gang of Four (GoF) design patterns implemented in TypeScript

## 🧭 Quick Navigation

| Category       | Pattern                                           | Description                          |
| -------------- | ------------------------------------------------- | ------------------------------------ |
| 🏗️ Structural  | [Composite](#-composite)                          | Compose objects into tree structures |
| 🏗️ Structural  | [Composite + Iterator](#-composite-with-iterator) | Traverse composite trees elegantly   |
| 🔄 Behavioural | [Iterator](#-iterator)                            | Sequential traversal made simple     |

---

## 🏗️ Structural Patterns

Patterns that deal with object composition and relationships

### 📦 Composite

Compose zero or more similar objects so they can be manipulated as one unified object.

**→ [Read the full guide](./src/structural/composite/README-composite.md)**

### 🔗 Composite with Iterator

Combine the Composite pattern with Iterator for powerful tree traversal capabilities.

**→ [Read the full guide](./src/structural/composite-with-iterator/README-composite-with-iterator.md)**

---

## 🔄 Behavioural Patterns

Patterns that focus on communication between objects

### 🔁 Iterator

Allows sequential traversal through a complex data structure without exposing its internal details.

**→ [Read the full guide](./src/behavioural/iterator/README-iterator.md)**

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run tests
npm test
```

---

## 📚 References

- [Design Patterns: Elements of Reusable Object-Oriented Software](https://en.wikipedia.org/wiki/Design_Patterns) — _The original GoF book_
- [Refactoring Guru](https://refactoring.guru/design-patterns) — _Visual pattern explanations_
