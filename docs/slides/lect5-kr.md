# CSIT5900 Lecture 5: Knowledge Representation, Reasoning, and CSPs

Source PDF: `lect5-kr.pdf`  
Extracted text source: `tmp/pdfs/ai-slides-text/lect5-kr.txt`  
Pages: 60  
Status: cleaned slide text for EduMind ingestion.

## Slide 1: Title

CSIT5900 Knowledge Representation, Reasoning and Constraint Satisfaction Problems

Department of Computer Science and Engineering  
Hong Kong University of Science and Technology

## Slide 2: Agents That Reason Logically

Puzzle:

- Two rooms each contain either a tiger or a cat, but not both.
- Each room has a sign.
- The signs are either both true or both false.

Question:

- What does Room I contain?
- What does Room II contain?

## Slide 3: Logical, Mathematical, and Commonsense Reasoning

Ranking puzzle facts:

1. Lisa is not next to Bob in the ranking.
2. Jim is immediately ahead of a biology major.
3. Bob is immediately ahead of Jim.
4. One of the women, Lisa or Mary, is a biology major.
5. One of the women is ranked first.

Question:

- What rankings are possible?

## Slide 4: Agents That Reason Dynamically

Wumpus World example:

- The agent must reason from local percepts such as stench, breeze, glitter, bump, and scream.
- The world contains pits, a wumpus, and gold.

## Slide 5: Wumpus World

Initial state:

- Agent is at `[1,1]`, facing east, with one arrow.

Goal:

- Get the gold, return to `[1,1]`, and climb out.

Actions:

- Grab gold
- Turn clockwise
- Turn counterclockwise
- Move forward
- Shoot arrow

Question:

- How can the agent infer that `[2,2]` is safe?

## Slide 6: Reasoning About Other Agents

Dirty forehead puzzle:

- A mother tells two children that at least one of their foreheads is dirty.
- The boy says he does not know whether his forehead is dirty.
- The girl says her forehead is dirty.
- The boy then says his forehead is dirty.

Question:

- How do they know?

## Slide 7: Knowledge-Based Agents

Two main components:

### Knowledge base

- A collection of known facts about the world.
- Each item is a sentence in a representation language.
- The knowledge base should be updated over time.

### Reasoning or inference

- Reasoning over the knowledge base to choose actions or answer queries.
- Search algorithms can be used to perform reasoning.

## Slide 8: Knowledge Representation and Reasoning

Knowledge representation is about representing information needed to solve a problem on a computer.

A knowledge representation language has:

- Syntax: legal expressions.
- Semantics: meanings of legal expressions.

Good KR languages should be:

- Expressive and concise like natural language.
- Unambiguous and precise like formal languages.

Logical inference derives new sentences from old ones.

Common logics:

- Propositional logic
- First-order predicate logic

## Slide 9: Propositional Logic

This section introduces propositional logic.

## Slide 10: Language

The syntax of a logic describes how to form legal sentences.

To define a language:

- Define available symbols.
- Define formation rules.

This is analogous to programming language syntax.

## Slide 11: Propositional Logic Language

Logical symbols:

- Parentheses
- Sentential connectives: `not`, `and`, `or`, `implies`, `equivalent`

Non-logical symbols:

- Proposition symbols such as `p1`, `p2`, ...

Formation rules:

- A proposition symbol is a sentence.
- If `alpha` and `beta` are sentences, then the following are sentences:
  - `not alpha`
  - `alpha and beta`
  - `alpha or beta`
  - `alpha implies beta`
  - `alpha equivalent beta`

## Slide 12: Translation Example

Propositions:

- `R`: the suspect must be released from custody.
- `E`: the evidence obtained is admissible.

Examples:

- Evidence is inadmissible: `not E`.
- Evidence is admissible and the suspect need not be released: `E and not R`.
- Either evidence is admissible or the suspect must be released: `E or R`.

Discussion:

- How should "but" be translated?

## Slide 13: Semantics - Truth Conditions

An interpretation or truth assignment maps each proposition symbol to:

```text
{T, F}
```

The meaning of complex sentences is defined by truth tables for the logical connectives.

## Slide 14: Entailment

Definitions:

- A truth assignment satisfies a sentence `alpha` if `alpha` is true under that assignment.
- `Sigma |= alpha` means every truth assignment satisfying every sentence in `Sigma` also satisfies `alpha`.
- A tautology is a sentence true under every truth assignment.

Deduction theorem:

```text
{alpha_1, ..., alpha_n} |= alpha
iff
|= (alpha_1 and ... and alpha_n) implies alpha
```

## Slide 15: Example Tautologies

Important tautologies:

- De Morgan's laws
- Distributive laws
- Excluded middle
- Contradiction
- Contraposition
- Exportation

Connectives can be defined using `not` and `or`.

## Slide 16: Query Answering

Example:

- If it is sunny, then you get mail.
- If it is raining or sleeting, then you still get mail.
- Tomorrow it will be either raining or sunny.

Axiomatization:

```text
Rain or Sunny
Sunny implies Mail
(Rain or Sleet) implies Mail
```

Query:

```text
Does KB entail Mail?
```

## Slide 17: Problem Solving by Finding Models

Graph coloring problem:

- Assign a color to each node.
- Adjacent nodes cannot have the same color.

Axiomatization:

- Each node has exactly one color.
- Adjacent nodes do not share a color.
- The graph supplies adjacency facts.

Each model of the theory is a valid graph coloring.

## Slide 18: Clausal Representation

A formula can be represented by a set of clauses.

Definitions:

- A literal is a proposition symbol or its negation.
- A clause is a disjunction of literals.

## Slide 19: CNF

A set of clauses represents a formula in conjunctive normal form.

Steps to convert to CNF:

1. Eliminate implication and equivalence.
2. Push negation inward.
3. Distribute `or` over `and`.
4. Simplify repeated literals and double negation.
5. Remove clauses containing both a literal and its complement.

## Slide 20: CNF Example

The formula:

```text
((p implies q) implies p) implies q
```

can be converted into the clausal form:

```text
{not p or q}
```

## Slide 21: Resolution Rule of Inference

Resolution:

From:

```text
p or C1
not p or C2
```

infer:

```text
C1 or C2
```

The inferred clause is the resolvent.

Special case:

```text
p
not p
```

resolve to the empty clause `[]`, which represents contradiction.

## Slide 22: Properties of Resolution

Resolution is sound:

```text
{p or alpha, not p or beta} |= alpha or beta
```

If a set of clauses derives the empty clause, the set is unsatisfiable.

## Slide 23: Proof by Refutation

Resolution is sound and complete for deriving the empty clause:

```text
S is unsatisfiable iff S derives []
```

To prove:

```text
Sigma |= alpha
```

show:

```text
Sigma union {not alpha}
```

is unsatisfiable.

## Slide 24: Resolution Procedure

To determine whether `KB |= alpha`:

1. Put `KB` and `not alpha` into CNF to get clause set `S`.
2. If `[]` is in `S`, return unsatisfiable.
3. Find two clauses that resolve to a new clause.
4. Add the new clause to `S`.
5. Repeat until `[]` is derived or no new clauses can be generated.

## Slide 25: Resolution Example - Girl

Knowledge base includes:

- `FirstGrade`
- `FirstGrade implies Child`
- `Child and Female implies Girl`
- `Female`

To show:

```text
KB |= Girl
```

add `not Girl` and derive the empty clause by resolution.

## Slide 26: Resolution Example - Mail

Knowledge base:

```text
Rain or Sun
Sun implies Mail
(Rain or Sleet) implies Mail
```

Query:

```text
KB |= Mail
```

Adding `not Mail` leads to contradiction, so `Mail` is entailed.

The same KB does not entail `Rain`.

## Slide 27: Satisfiability

SAT is the problem of deciding whether a set of clauses is satisfiable.

Facts:

- SAT was the first NP-complete problem discovered by Cook.
- 3SAT is equivalent to SAT in computational complexity.
- SAT algorithms have many applications.

Soundness and completeness:

- A sound procedure returns yes only when the input is satisfiable.
- A complete procedure returns yes whenever the input is satisfiable.

## Slide 28: Constraint Satisfaction Problem

A CSP consists of:

- A finite set of variables and domains.
- A finite set of constraints.

A solution is an assignment to variables satisfying all constraints.

Example: 8-queens problem.

- Variables: `q1, ..., q8`
- Domain: `{1, ..., 8}`
- Constraints: queens do not attack each other.

## Slide 29: Constructive Methods

Constructive methods use search, especially depth-first search.

CSP as search:

- States: partial assignments.
- Initial state: empty assignment.
- Operator: pick a variable and assign a value.
- Path cost: 0.
- Goal condition: all constraints are satisfied.

## Slide 30: Constraint Propagation

Constraint propagation prunes the search space.

Given a partial assignment, constraints eliminate impossible values for remaining variables.

The details depend on the constraint type.

## Slides 31-33: 4-Queens Constraint Graph

The slides illustrate constraint propagation on a 4-queens problem.

Key idea:

- Variables are nodes.
- Domains label nodes.
- Edges indicate constraints between variables.
- Assigning one variable can reduce the domains of others.

## Slide 34: DPLL

Davis-Putnam-Logemann-Loveland (DPLL) is a complete constructive method for SAT.

Core rules:

- If the CNF is empty, return yes.
- If an empty clause exists, return no.
- If there is a pure literal, set it true.
- If there is a unit clause, set its literal true.
- Otherwise choose a variable and branch on true and false.

## Slide 35: Modern DPLL

Modern SAT solvers combine:

- DPLL
- Constraint propagation
- Conflict-driven clause learning
- Dependency-based backtracking

When a conflict is found:

- Analyze the conflict.
- Learn a new clause.
- Backtrack to a relevant decision point.

## Slide 36: GSAT

GSAT is an incomplete randomized local search method.

Procedure:

1. Generate a random truth assignment.
2. If it satisfies the CNF, return yes.
3. Otherwise move to a best successor by flipping one variable.
4. Restart if needed.

Incomplete methods cannot prove unsatisfiability but can be fast on satisfiable instances.

## Slide 37: Heuristic Repair

Heuristic repair starts with a proposed complete assignment and repairs it.

In CSP:

- Constructive methods build an assignment gradually.
- Heuristic repair starts with a full assignment that may violate constraints.

Min-conflicts:

- Select a variable to adjust.
- Choose a value that minimizes conflicts.

## Slide 38: 8-Queens by Min-Conflicts

The slide illustrates moving queens to reduce conflicts.

Main point:

- Local repair can quickly find solutions in constraint problems such as 8-queens.

## Slide 39: Unsupervised Learning

Unsupervised learning uses input examples without explicit labels.

Commonly, it refers to clustering:

- Input: a set of examples `x`.
- Output: clusters.

Reinforcement learning is considered separately because samples are generated dynamically under agent control.

## Slide 40: English Word Clustering

Brown clustering example:

- Input: large corpus of words.
- Output: clusters of related words.

Example clusters:

- Days of the week
- Months
- People nouns
- Directional words
- Materials
- Size adjectives
- Occupations and human categories

## Slide 41: Image Clustering

Neural networks can learn features that cluster large image collections into many categories.

Example:

- 10 million YouTube still images clustered into 22,000 categories.

## Slide 42: Clustering

Given training inputs:

```text
D_t = {x1, ..., xn}
```

assign each input to one cluster in:

```text
{C1, ..., CK}
```

As a CSP:

- Variables: `c1, ..., cn`
- Domain: `{1, ..., K}`
- Intuition: similar inputs should get the same assignment.

## Slide 43: K-Means

K-means represents each cluster by a centroid `mu_i`.

Optimization objective:

```text
minimize sum_i ||phi(x_i) - mu_{c_i}||^2
```

Variables:

- Cluster assignments `c_i`
- Centroids `mu_i`

## Slide 44: K-Means Example

Examples in one-dimensional feature space:

```text
phi(D_t) = {1, 2, 10, 11}
K = 2
```

Natural solution:

```text
c1 = c2 = 1
c3 = c4 = 2
mu1 = 1.5
mu2 = 10.5
```

Knowing centroids makes assignments easy. Knowing assignments makes centroids easy.

## Slide 45: K-Means Algorithm

Informal algorithm:

1. Initialize centroids `mu1, ..., muK`.
2. Repeat:
   - Compute best assignments for the current centroids.
   - Compute best centroids for the current assignments.

## Slide 46: Problems with Propositional Agents

Problem:

- Too many propositions.
- Too many rules.

Solution:

- Move to first-order logic.

## Slide 47: First-Order Logic

First-order logic is more expressive and concise than propositional logic.

In FOL:

- The world consists of objects.
- Facts are properties of objects or relations among objects.

Examples:

- "One plus two equals three."
- "Squares neighboring the wumpus are smelly."
- "Evil King John ruled England in 1200."

## Slide 48: FOL Syntax - Alphabet

Logical symbols:

- Punctuation and parentheses
- Connectives
- Quantifiers: `forall`, `exists`
- Equality
- Variables

Non-logical symbols:

- Predicate symbols
- Function symbols
- Constant symbols

## Slide 49: FOL Terms and Sentences

Terms refer to objects:

- Constants
- Variables
- Function applications

Sentences represent facts:

- Predicate applications
- Equality
- Compound sentences
- Quantified sentences

## Slide 50: Example Sentences

Examples:

- `Brother(richard, john)`
- `fatherOf(richard) = fatherOf(john)`
- `Student(firstChild(john, mary), ust)`

Quantifiers:

- Universal quantification for general rules.
- Existential quantification for existence statements.

## Slide 51: Nested Quantifiers

Examples:

- Brothers are siblings:

```text
forall x, y: Brother(x, y) implies Sibling(x, y)
```

- Everybody loves somebody:

```text
forall x exists y: Loves(x, y)
```

- A mother is a female with a child:

```text
forall x: Mother(x) iff Female(x) and exists y Child(x, y)
```

## Slide 52: FOL Examples

Examples:

- All purple mushrooms are poisonous.
- No purple mushroom is poisonous.
- All mushrooms are either purple or poisonous.
- All mushrooms are either purple or poisonous but not both.

## Slide 53: More FOL Examples

Examples:

- All purple mushrooms except one are poisonous.
- There are exactly two purple mushrooms.

These require quantifiers and equality.

## Slide 54: Rule-Based Expert Systems

An expert system embodies knowledge about a specialized field.

Examples:

- DENDRAL
- MYCIN
- PROSPECTOR
- XCON/R1
- American Express loan processing expert system

## Slide 55: Loan-Approval Expert System

Example rules:

```text
COLLAT and PYMT and REP -> OK
APP -> COLLAT
RATING -> REP
INC -> PYMT
BAL and REP -> OK
```

Meaning:

- `OK`: loan should be approved.
- Other propositions represent collateral, payment ability, reputation, appraisal, credit rating, income, and balance sheet.

## Slide 56: Rule Learning

Rule-based expert systems are widely used, but collecting rules from experts is costly.

Automatic rule acquisition is useful.

The lecture introduces the generic separate-and-conquer algorithm for learning propositional rules.

## Slide 57: Loan-Approval Example

Training data contains records with features:

- `APP`
- `RATING`
- `INC`
- `BAL`

Target:

- `OK`

Goal:

- Learn rules of the form:

```text
alpha1 and ... and alphan -> OK
```

## Slide 58: Generic Separate-and-Conquer Algorithm

Given target atom `gamma` and training set `Sigma`:

1. Initialize current examples.
2. Initialize the learned rule set to empty.
3. Repeatedly learn one rule whose antecedent covers mainly positive examples.
4. Add the rule.
5. Remove covered positive examples.
6. Continue until all or most positive examples are covered.

## Slide 59: A Heuristic

A common heuristic selects a feature `alpha` maximizing:

```text
r_alpha = n_alpha_positive / n_alpha
```

where:

- `n_alpha` is the number of examples covered after adding `alpha`.
- `n_alpha_positive` is the number of positive covered examples.

## Slide 60: GSCA Loan-Approval Example

Start with:

```text
true -> OK
```

This covers too many negative examples, so features are added to narrow the rule.

Example:

- Choose `BAL` first.
- Then choose `RATING`.

Learned rule:

```text
BAL and RATING -> OK
```

After learning a rule, remove covered positive examples and continue.
