# CSIT5900 Lecture 3: Agents that Search

Source PDF: `lect3-search.pdf`  
Extracted text source: `tmp/pdfs/ai-slides-text/lect3-search.txt`  
Pages: 34  
Status: cleaned slide text for EduMind ingestion.

## Slide 1: Title

CSIT5900 Lecture 3: Agents that Search

Department of Computer Science and Engineering  
Hong Kong University of Science and Technology

## Slide 2: Overview

Topics:

- Search problems
- Uninformed search
- Heuristic search
- Hill climbing

## Slide 3: Missionaries and Cannibals Problem

Three missionaries and three cannibals must cross a river using a boat that can carry at most two people.

Constraint:

- On either bank, if missionaries are present, they cannot be outnumbered by cannibals.
- The boat cannot cross the river by itself.

Related problem:

- Jealous husbands problem, where three married couples must cross a river with constraints on which people may be present together.

## Slide 4: Search in State Spaces - The 8-Puzzle

8-puzzle solving agent:

- Accessible environment: the agent knows exactly which state it is in.
- Actions: move the blank tile left, right, up, or down.
- Goal: find a sequence of actions that changes the environment from the initial state to the goal state.

## Slide 5: Search Problem Definition

A search problem consists of:

- A set of states
- An initial state
- A set of deterministic actions or operators
- A goal test
- A path cost function

A solution is a sequence of actions that leads to a goal state.

## Slide 6: 8-Puzzle Formulation

For the 8-puzzle:

- States: arrangements of the blank and numbers 1 to 8.
- Initial state: any given arrangement.
- Goal test: the blank is in the middle and the numbers are in clockwise order.
- Actions: move the blank left, right, up, or down.
- Path cost: length of the path.

## Slide 7: Problem-Solving Agents

Problem-solving agents are often goal-directed.

Key idea:

- To choose the best action, the agent systematically considers expected outcomes of possible action sequences that lead to a goal state.

Steps:

1. Goal and problem formulation.
2. Search process.
3. Action execution.

## Slide 8: Searching for Solutions

Searching can be viewed as building a search tree:

- The root corresponds to the initial state.
- At each step, the search algorithm chooses one leaf node to expand.
- Expansion applies all possible actions to the state at that node.

General search algorithm:

```text
GENERAL-SEARCH(problem, strategy):
    initialize the search tree with the initial state
    loop:
        if there are no candidates, return failure
        choose a leaf node for expansion according to strategy
        if the node contains a goal state, return the solution
        otherwise expand the node and add children to the tree
```

## Slide 9: Breadth-First Search

Breadth-first search expands the root first, then expands all leaf nodes level by level.

Properties:

- Complete if a solution exists.
- Returns a shortest-length solution when multiple solutions exist.
- Time and space complexity are very high, making it impractical for many real-world problems.

## Slide 10: Breadth-First Search of the 8-Puzzle

The slide illustrates breadth-first expansion of an 8-puzzle search tree.

Main point:

- BFS systematically explores all states at depth `d` before moving to depth `d + 1`.

## Slide 11: Search Strategies

A search strategy determines the order in which search tree nodes are expanded.

Evaluation criteria:

- Completeness: guaranteed to find a solution if one exists?
- Time complexity: how long does it take?
- Space complexity: how much memory is needed?
- Optimality: does it find the best solution?

Types:

- Uninformed or blind search
- Informed or heuristic search

## Slide 12: Depth-First Search

Depth-first search generates successors one at a time.

Characteristics:

- As soon as a successor is generated, one of its successors is generated.
- Usually uses a depth bound.
- Does not generate successors beyond the depth bound.

## Slide 13: Comparing BFS and DFS

Let:

- `b` be the branching factor.
- `d` be the depth of the solution.
- `m` be the depth bound for depth-first search.

Comparison:

| Strategy | Time | Space | Optimal | Complete |
| --- | --- | --- | --- | --- |
| Breadth-first | `b^d` | `b^d` | Yes | Yes |
| Depth-first | `b^m` | `b*m` | No | Yes, if `m >= d` |

## Slide 14: Iterative Deepening Search

Iterative deepening combines:

- Linear memory requirements of depth-first search.
- Optimality guarantees of breadth-first search when a goal can be found.

It repeatedly runs depth-first search with increasing depth limits:

```text
depth = 1, 2, 3, ...
```

until a goal is found.

## Slide 15: Avoiding Repeated States

Newly expanded nodes may contain states already encountered.

Ways to handle repeated states:

1. Do not return to the state just came from.
2. Do not create a path with cycles.
3. Do not generate any state that has been generated before.

These options increase in effectiveness and computational overhead.

## Slide 16: Heuristic Search

A heuristic function maps states to numbers.

Usually:

- It estimates how far the current state is from a goal state.
- Smaller values indicate states closer to a goal.

Heuristic or best-first search chooses nodes with the smallest heuristic value for expansion.

## Slide 17: Eight-Puzzle Heuristic

Example heuristic:

```text
h(n) = number of tiles out of place compared with the goal
```

The slide illustrates search using this heuristic.

Main point:

- A heuristic can guide search toward the goal but can still lead to fruitless wandering.

## Slide 18: Adding Path Cost

The same heuristic can be combined with path cost:

```text
f(n) = g(n) + h(n)
```

where:

- `g(n)` is the path cost so far.
- `h(n)` is the heuristic estimate to the goal.

This is the basis for A* search.

## Slide 19: A* Search

Evaluation function:

```text
f(n) = g(n) + h(n)
```

Meaning:

- `g(n)`: actual path cost from the start node to `n`.
- `h(n)`: estimated remaining cost.
- `f(n)`: estimated cost of the cheapest solution path through `n`.

Goal:

- Find the cheapest solution.

## Slide 20: A* Search by Tree

A* tree search:

1. Create a search tree with the start node.
2. Put the start node on `OPEN`.
3. If `OPEN` is empty, fail.
4. Remove the first node from `OPEN`.
5. If it is a goal node, return the solution.
6. Expand it, excluding ancestor states.
7. Add successors to `OPEN`.
8. Reorder `OPEN` by increasing `g(n) + h(n)`.

Ties are resolved in favor of the deepest node.

## Slide 21: Route Finding

The slide uses a map of Romanian cities and straight-line distances to Bucharest.

This is a standard example of A* search:

- States: cities
- Actions: drive along roads
- Path cost: road distance
- Heuristic: straight-line distance to Bucharest

## Slide 22: A* Search for Route Finding

The example starts from Arad.

A* expands candidate routes using:

```text
f(n) = distance traveled so far + straight-line distance to Bucharest
```

## Slide 23: Behavior of A*

Assumptions:

- `h` is admissible: it never overestimates the true cost.
- `g` is the sum of operator costs along the path.
- Each operator has cost greater than some positive amount.
- The number of operators is finite.

Under these conditions, `h` can be revised so that `f = g + h` is nondecreasing along any path. This property is called monotonicity.

## Slide 24: A* Expansion

If `f*` is the cost of an optimal solution:

- A* expands all nodes with `f(n) < f*`.
- A* may expand some nodes with `f(n) = f*` before finding the goal.

## Slide 25: Completeness and Optimality of A*

Under the assumptions:

- A* is complete.
- A* is optimal.

Reason:

- A* expands nodes in increasing `f` order.
- It cannot find a suboptimal goal before an optimal goal when the heuristic is admissible.

A* is optimally efficient in the sense of Dechter and Pearl (1985).

## Slide 26: Complexity of A*

Complexity:

- Number of expanded nodes is exponential in solution length.
- All generated nodes are kept in memory.
- A* usually runs out of space before it runs out of time.
- Good heuristics can still give significant savings over uninformed search.

Memory-bounded extensions:

- Iterative deepening A*
- Simplified memory-bounded A*

## Slide 27: Heuristic Functions for the 8-Puzzle

Admissible heuristics:

- `h1`: number of misplaced tiles.
- `h2`: sum of Manhattan distances of tiles from goal positions.

`h2` is better than `h1` because it dominates `h1`:

```text
for every node n, h2(n) >= h1(n)
```

as long as both are admissible.

## Slide 28: Inventing Heuristic Functions

Questions:

- How can good heuristics be found?
- Can a computer mechanically invent such heuristics?

Strategy:

- Create a relaxed problem by removing restrictions.
- Use the path cost of the relaxed problem as the heuristic for the original problem.

## Slide 29: Inventing Heuristics for the 8-Puzzle

Original operator:

- A tile can move from square `A` to square `B` if `A` is adjacent to `B` and `B` is blank.

Relaxed versions:

- A tile can move from `A` to `B` if `A` is adjacent to `B`.
- A tile can move from `A` to `B` if `B` is blank.
- A tile can move from `A` to `B`.

These relaxed problems generate heuristics such as Manhattan distance and misplaced tiles.

ABSOLVER (Prieditis 1993) automatically generated heuristics using this idea.

## Slide 30: Search as Function Maximization

Function maximization problem:

- Find `x` such that `Value(x)` is maximal.

Examples:

- 8-queens problem
- VLSI design

For 8-queens:

- Find a state in which no queens attack each other.
- Define a value function that is maximal when no queens are attacked.

## Slide 31: Hill Climbing

Basic idea:

1. Start at the initial state.
2. At each step, move to the next state with the highest value.
3. Keep only the current node and its evaluation.

Hill climbing does not maintain a full search tree and does not backtrack.

## Slide 32: Hill-Climbing Algorithm

```text
HILL-CLIMBING(problem):
    current = initial state
    loop:
        next = highest-valued successor of current
        if VALUE(next) < VALUE(current):
            return current
        current = next
```

## Slide 33: Simulated Annealing

Hill climbing can get stuck in a local maximum.

Simulated annealing avoids this by:

- Picking a random move rather than always the best move.
- Accepting better moves.
- Sometimes accepting worse moves with a probability that decreases over time.

The idea comes from gradually cooling liquid metal until it freezes.

It has been effective in applications such as factory scheduling.

## Slide 34: What Problems Can Be Search Problems?

Examples:

- Robot navigation in a grid world
- GPS route planning
- Robot task planning in blocks world
- Financial planning over multiple years

Key idea:

- Many problems can be formulated as search problems if states, actions, goals, and costs can be defined.
