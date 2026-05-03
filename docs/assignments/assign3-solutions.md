# CSIT5900 Assignment 3 - Questions and Solutions

Status: organized assignment text with worked solutions for EduMind demonstration.

Course: CSIT5900 Artificial Intelligence
Assignment: Assignment 3
Assigned: 2026-04-25
Due: 2026-05-05 23:59
Source PDF: `assign3.pdf`
Extracted text source: `tmp/pdfs/ai-assignments/assign3.txt`

Related slide notes:

- [Knowledge Representation, Reasoning, and CSPs](../slides/lect5-kr.md)
- [Game Theory, Game Tree Search, and Auction](../slides/games.md)

## 1. Assignment Overview

This assignment has two parts:

- Written part: Problems 1-7
- Programming part using Z3: Problems 8-9

Main topics:

- Resolution and proof by refutation
- First-order logic representation
- Rule learning with GSCA
- Nash equilibria
- First-price auctions
- Minimax search
- Alpha-beta pruning
- Model finding with Z3

## 2. Written Part

## Problem 1: Unicorn Reasoning

### Question

Given:

1. If the unicorn is mythical, then it is immortal.
2. If the unicorn is not mythical, then it is a mortal mammal.
3. If the unicorn is either immortal or a mammal, then it is horned.
4. The unicorn is magical if it is horned.

Queries:

- Is the unicorn mythical?
- Is it magical?
- Is it horned?

For yes answers, give a proof by refutation using resolution. For no answers, give a satisfying assignment for the facts and the negated query.

### Vocabulary

- `M`: the unicorn is mythical
- `I`: the unicorn is immortal
- `T`: the unicorn is mortal
- `A`: the unicorn is a mammal
- `H`: the unicorn is horned
- `G`: the unicorn is magical

### Knowledge Base

```text
M -> I
not M -> (T and A)
(I or A) -> H
H -> G
```

CNF clauses:

```text
1. not M or I
2. M or T
3. M or A
4. not I or H
5. not A or H
6. not H or G
```

### Query 1: Is the Unicorn Mythical?

Answer: no, `M` is not entailed.

A countermodel satisfying the facts but not `M`:

```text
M = false
I = false
T = true
A = true
H = true
G = true
```

Check:

- `M -> I` is true because `M` is false.
- `not M -> (T and A)` is true because `T` and `A` are true.
- `(I or A) -> H` is true because `A` and `H` are true.
- `H -> G` is true because `H` and `G` are true.

### Query 2: Is the Unicorn Horned?

Answer: yes, `H` is entailed.

Proof by refutation:

Add negated query:

```text
7. not H
```

Resolution steps:

```text
8.  not I        from 4 and 7
9.  not M        from 1 and 8
10. not A        from 5 and 7
11. M            from 3 and 10
12. []           from 9 and 11
```

Since contradiction is derived, `H` follows from the knowledge base.

### Query 3: Is the Unicorn Magical?

Answer: yes, `G` is entailed.

Proof by refutation:

Add negated query:

```text
7. not G
```

Resolution steps:

```text
8.  not H        from 6 and 7
9.  not I        from 4 and 8
10. not M        from 1 and 9
11. not A        from 5 and 8
12. M            from 3 and 11
13. []           from 10 and 12
```

Since contradiction is derived, `G` follows from the knowledge base.

## Problem 2: First-Order Logic Representation

### Question

Represent the given English sentences in first-order logic using a consistent vocabulary.

### Vocabulary

Constants:

- `History`: the History class
- `Biology`: the Biology class
- `Ted`: Ted

Predicates:

- `Student(x)`: `x` is a student
- `Person(x)`: `x` is a person
- `Class(c)`: `c` is a class
- `Takes(x, c)`: `x` takes class `c`
- `Failed(x, c)`: `x` failed class `c`
- `Vegetarian(x)`: `x` is a vegetarian
- `Dislikes(x, y)`: `x` dislikes `y`
- `Smart(x)`: `x` is smart
- `DoesHomeworkFor(x, y)`: `x` does homework for `y`

### a. Not all students take both History and Biology.

```text
not forall x (
  Student(x) -> (Takes(x, History) and Takes(x, Biology))
)
```

Equivalent form:

```text
exists x (
  Student(x) and not (Takes(x, History) and Takes(x, Biology))
)
```

### b. Only one student failed the History class.

```text
exists x (
  Student(x)
  and Failed(x, History)
  and forall y (
    (Student(y) and Failed(y, History)) -> y = x
  )
)
```

### c. A person who dislikes all vegetarians is not smart.

```text
forall x (
  (Person(x) and forall y (Vegetarian(y) -> Dislikes(x, y)))
  -> not Smart(x)
)
```

### d. Ted dislikes people who dislike vegetarians.

Using "dislike vegetarians" as "dislike all vegetarians":

```text
forall x (
  (Person(x) and forall y (Vegetarian(y) -> Dislikes(x, y)))
  -> Dislikes(Ted, x)
)
```

### e. There is a student who does homework for those and only those who do not do homework for themselves.

```text
exists x (
  Student(x)
  and forall y (
    DoesHomeworkFor(x, y) <-> not DoesHomeworkFor(y, y)
  )
)
```

Note: this is the standard "barber-style" self-reference pattern. As a pure representation task, the formula above captures the sentence directly.

## Problem 3: GSCA Rule Learning

### Question

Use GSCA to learn rules for when to hire an applicant using the given examples.

### Attributes

- `UST`: graduated from HKUST
- `HKU`: graduated from HKU
- `CU`: graduated from CU
- `GPA`: received good grades
- `REC`: got good recommendation letters
- `EXP`: had prior related work experience
- `Hire`: target predicate

### Training Data Summary

Positive examples:

```text
1, 3, 4, 5
```

Negative examples:

```text
2, 6, 7, 8, 9, 10, 11
```

### GSCA Step 1

Start with:

```text
true -> Hire
```

This covers all examples, including negatives.

Compute the positive ratio for each single feature:

| Feature | Covered Examples         |  Positives |      Ratio |
| ------- | ------------------------ | ---------: | ---------: |
| `EXP` | 1, 3, 5, 8               |    1, 3, 5 | 3/4 = 0.75 |
| `GPA` | 1, 2, 3, 4, 5, 6, 7      | 1, 3, 4, 5 |        4/7 |
| `REC` | 1, 3, 4, 5, 6, 7, 10, 11 | 1, 3, 4, 5 |        4/8 |
| `HKU` | 1, 3, 7, 9               |       1, 3 |        2/4 |
| `UST` | 2, 4, 8                  |          4 |        1/3 |
| `CU`  | 5, 6, 10, 11             |          5 |        1/4 |

Choose `EXP`.

Now refine:

| Added Feature   | Covered Examples | Positives |   Ratio |
| --------------- | ---------------- | --------: | ------: |
| `EXP and GPA` | 1, 3, 5          |   1, 3, 5 | 3/3 = 1 |
| `EXP and REC` | 1, 3, 5          |   1, 3, 5 | 3/3 = 1 |
| `EXP and HKU` | 1, 3             |      1, 3 | 2/2 = 1 |
| `EXP and CU`  | 5                |         5 | 1/1 = 1 |
| `EXP and UST` | 8                |      none |     0/1 |

One valid GSCA choice is `GPA`, giving:

```text
GPA and EXP -> Hire
```

This covers positive examples 1, 3, and 5, and no negatives.

Remove examples 1, 3, and 5 from the positive set.

### GSCA Step 2

Remaining positive example:

```text
4
```

On the remaining examples, single-feature ratios include:

| Feature | Covered Examples | Positives | Ratio |
| ------- | ---------------- | --------: | ----: |
| `UST` | 2, 4, 8          |         4 |   1/3 |
| `GPA` | 2, 4, 6, 7       |         4 |   1/4 |
| `REC` | 4, 6, 7, 10, 11  |         4 |   1/5 |

Choose `UST`.

Refine with `REC`:

```text
UST and REC -> Hire
```

This covers example 4 and no negatives.

### Learned Rule Set

One valid GSCA result is:

```text
GPA and EXP -> Hire
UST and REC -> Hire
```

These rules cover all positive examples and none of the negative examples.

## Problem 4: Nash Equilibrium

### Question

Find the Nash equilibria of the game:

|              | Fed contract | Fed do nothing | Fed expand |
| ------------ | -----------: | -------------: | ---------: |
| Pol contract |         1, 7 |           4, 9 |       6, 6 |
| Pol idle     |         2, 8 |           5, 5 |       9, 4 |
| Pol expand   |         3, 3 |           7, 2 |       8, 1 |

### Best Responses

Politicians' best responses:

- If Fed contracts: Pol expands, payoff `3`.
- If Fed does nothing: Pol expands, payoff `7`.
- If Fed expands: Pol idles, payoff `9`.

Fed's best responses:

- If Pol contracts: Fed does nothing, payoff `9`.
- If Pol idles: Fed contracts, payoff `8`.
- If Pol expands: Fed contracts, payoff `3`.

### Answer

The unique Nash equilibrium is:

```text
(Pol expand, Fed contract)
```

Payoff:

```text
(3, 3)
```

This is the only cell where both players are playing best responses.

## Problem 5: First-Price Auction Game

### Question

Two agents participate in a first-price auction. Ties are broken randomly. Both agents have value `6` for the item and bid positive integers up to their value.

Formulate this auction as a game and find all Nash equilibria.

### Game Formulation

Players:

```text
N = {1, 2}
```

Actions:

```text
A1 = A2 = {1, 2, 3, 4, 5, 6}
```

Utility for player `i` with bid `b_i` against opponent bid `b_j`:

```text
u_i(b_i, b_j) = 6 - b_i,       if b_i > b_j
u_i(b_i, b_j) = (6 - b_i)/2,   if b_i = b_j
u_i(b_i, b_j) = 0,             if b_i < b_j
```

### Nash Equilibria

All pure Nash equilibria:

```text
(4, 4)
(5, 5)
(6, 6)
```

Reason:

- At `(4, 4)`, each player gets `1`. Bidding `5` wins and also gives `1`, so no strict improvement; lower bids lose; bidding `6` gives `0`.
- At `(5, 5)`, each player gets `0.5`. Bidding `6` wins but gives `0`; lower bids lose.
- At `(6, 6)`, each player gets `0`. No bid can give a positive payoff against a bid of `6`.

For `(b, b)` with `b <= 3`, a player can bid `b + 1` and get a higher payoff, so those are not equilibria.

No asymmetric bid pair is a Nash equilibrium.

## Problem 6: Minimax with Perfect Decisions

### Question

Perform minimax on the given tree.

### Tree Structure

The tree is interpreted as:

```text
A: MAX
B, C: MIN
F, G: MAX
I: MIN
```

Leaves:

```text
D = 3
E = 5
M = 0
N = 7
J = 5
K = 7
L = 8
H = 4
```

Parent-child structure:

```text
A -> B, C
B -> D, E
C -> F, G, H
F -> I, J
I -> M, N
G -> K, L
```

### Bottom-Up Evaluation

```text
I = min(M, N) = min(0, 7) = 0
F = max(I, J) = max(0, 5) = 5
G = max(K, L) = max(7, 8) = 8
B = min(D, E) = min(3, 5) = 3
C = min(F, G, H) = min(5, 8, 4) = 4
A = max(B, C) = max(3, 4) = 4
```

### Answer

The minimax value of the root is:

```text
A = 4
```

MAX should choose the branch through:

```text
A -> C -> H
```

## Problem 7: Alpha-Beta Pruning

### Question

Perform alpha-beta pruning on the tree from Problem 6:

- Left-to-right leaf order
- Right-to-left leaf order

### Left-to-Right Alpha-Beta

Leaf generation order begins:

```text
D, E, M, N, J, K, L, H
```

Visited leaves:

```text
D, E, M, J, K, H
```

Pruned leaves:

```text
N, L
```

Explanation:

- After evaluating `B = 3`, root `A` has `alpha = 3`.
- In subtree `I`, leaf `M = 0` makes `I <= alpha`, so `N` is pruned.
- In subtree `G`, leaf `K = 7` is already enough to exceed `C`'s current beta bound, so `L` is pruned.

Result:

```text
A = 4
```

### Right-to-Left Alpha-Beta

Right-to-left search visits the right side first.

Visited leaves:

```text
H, L, J, E, D
```

Pruned leaves:

```text
K, N, M
```

Explanation:

- In subtree `G`, leaf `L = 8` is enough to prune `K`.
- In subtree `F`, leaf `J = 5` is enough to prune subtree `I`, so `N` and `M` are not evaluated.
- The remaining `B` subtree is still checked enough to confirm the root value.

Result:

```text
A = 4
```

## 3. Programming Part

## Problem 8: Lady or Tiger

### Question

There are three rooms. Each contains either a lady or a tiger, but not both. Exactly one room contains a lady and the other two contain tigers. Each room has a sign, and at most one sign is true.

Signs:

1. Room I: a tiger is in this room.
2. Room II: a lady is in this room.
3. Room III: a tiger is in Room II.

Which room contains the lady?

### Reasoning

Let:

- `L1`, `L2`, `L3`: room 1, 2, or 3 contains a lady.
- `T1`, `T2`, `T3`: room 1, 2, or 3 contains a tiger.

Exactly one lady:

```text
exactly one of L1, L2, L3 is true
T_i iff not L_i
```

Signs:

```text
S1 = T1
S2 = L2
S3 = T2
```

At most one sign is true.

Test possibilities:

- If `L1` is true, then `T1` is false, `L2` is false, `T2` is true. Exactly one sign is true. This is consistent.
- If `L2` is true, then `S1` and `S2` are both true. Not allowed.
- If `L3` is true, then `S1` and `S3` are both true. Not allowed.

### Answer

The lady is in:

```text
Room I
```

Rooms II and III contain tigers.

### Z3 Query Sketch

To prove `L1`, add `Not(L1)` to the knowledge base and check that it is unsatisfiable.

```python
from z3 import *

L1, L2, L3 = Bools("L1 L2 L3")
T1, T2, T3 = Bools("T1 T2 T3")

s = Solver()

s.add(T1 == Not(L1))
s.add(T2 == Not(L2))
s.add(T3 == Not(L3))
s.add(Or(L1, L2, L3))
s.add(Not(And(L1, L2)))
s.add(Not(And(L1, L3)))
s.add(Not(And(L2, L3)))

S1 = T1
S2 = L2
S3 = T2
s.add(Not(And(S1, S2)))
s.add(Not(And(S1, S3)))
s.add(Not(And(S2, S3)))

s.add(Not(L1))
print(s.check())  # unsat
```

## Problem 9: Ranking Problem

### Question

Facts:

1. Lisa is not next to Bob in the ranking.
2. Jim is ranked immediately ahead of a biology major.
3. Bob is ranked immediately ahead of Jim.
4. One of the women, Lisa and Mary, is a biology major.
5. One of the women is ranked first.

Find possible rankings for the four people.

### Reasoning

People:

```text
Lisa, Bob, Jim, Mary
```

Women:

```text
Lisa, Mary
```

Bob is immediately ahead of Jim, so the pair must appear as:

```text
Bob, Jim
```

Jim is immediately ahead of a biology major. Since one of the women is the biology major, the person immediately after Jim must be either Lisa or Mary.

Therefore the sequence must contain:

```text
Bob, Jim, Lisa
```

or:

```text
Bob, Jim, Mary
```

One woman is ranked first. If Lisa were first, the required `Bob, Jim, Mary` block would force Bob to be next to Lisa, violating the first fact. The only consistent arrangement is:

```text
Mary, Bob, Jim, Lisa
```

This satisfies:

- Mary is ranked first.
- Bob is immediately ahead of Jim.
- Jim is immediately ahead of Lisa.
- Lisa can be the biology major.
- Lisa is not next to Bob.

### Answer

The possible ranking is:

```text
1. Mary
2. Bob
3. Jim
4. Lisa
```

Lisa is the biology major.

### Z3 Model-Finding Sketch

```python
from z3 import *

people = ["Lisa", "Bob", "Jim", "Mary"]
rank = {p: Int(p) for p in people}

s = Solver()

for p in people:
    s.add(rank[p] >= 1, rank[p] <= 4)

s.add(Distinct([rank[p] for p in people]))

# Lisa is not next to Bob.
s.add(Abs(rank["Lisa"] - rank["Bob"]) != 1)

# Bob is immediately ahead of Jim.
s.add(rank["Bob"] + 1 == rank["Jim"])

# One of the women is ranked first.
s.add(Or(rank["Lisa"] == 1, rank["Mary"] == 1))

# One woman is the biology major, and Jim is immediately ahead of that person.
LisaBio = Bool("LisaBio")
MaryBio = Bool("MaryBio")
s.add(Or(LisaBio, MaryBio))
s.add(Not(And(LisaBio, MaryBio)))
s.add(Implies(LisaBio, rank["Jim"] + 1 == rank["Lisa"]))
s.add(Implies(MaryBio, rank["Jim"] + 1 == rank["Mary"]))

print(s.check())
print(s.model())
```
