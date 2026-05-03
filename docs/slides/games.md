# CSIT5900 Game Theory, Game Tree Search, and Auction

Source PDF: `games.pdf`  
Extracted text source: `tmp/pdfs/ai-slides-text/games.txt`  
Pages: 59  
Status: cleaned slide text for EduMind ingestion.

## Slide 1: Title

CSIT5900 Game Theory, Game Tree Search, and Auction

Department of Computer Science and Engineering  
Hong Kong University of Science and Technology

## Slide 2: Multi-Agent Systems

A multi-agent system is one where more than one agent coexists and interacts.

In addition to single-agent issues, multi-agent systems involve:

- How agents communicate.
- How agents cooperate.
- How agents act in the face of adversity.

## Slide 3: Examples

Examples of multi-agent settings:

- Two-person adversarial games such as chess, Go, and tic-tac-toe.
- Team games such as bridge and sports.
- Resource allocation among agents.
- Market mechanisms in society.

Important questions:

- What is the opponent like?
- How much time is available for each move?
- Why is the agent playing the game?

## Slide 4: Game Theory

Game theory studies how self-interested agents interact.

It has applications in:

- Economics
- Political science
- Social science
- Biology
- Computer science

Normal-form games are among the simplest and most fundamental games.

## Slide 5: Game Theory Definitions

Game theory mathematically studies strategic situations where each agent's success depends on the choices of others.

It can be viewed as a general framework for analyzing rational social interaction among humans, computers, animals, or other agents.

## Slide 6: Shared Network Example

Two friends share a network and both want to download a movie.

Possible outcomes:

- Both download: network is jammed; both get utility 2.
- Only one downloads: downloader gets 5; the other gets 0.
- Neither downloads: both get utility 3.

Questions:

- What should each person do?
- Does it depend on expected behavior of the other person?
- Does communication matter?
- What if the same situation repeats?

## Slide 7: Modeling Agents' Interests

Two ways to model interests:

- Preferences: agent prefers one outcome to another.
- Utility functions: numerical values assigned to outcomes.

Von Neumann and Morgenstern theorem:

- Under certain rationality axioms, preferences can be represented by a utility function.
- Expected utility can be computed over lotteries.

## Slide 8: Games in Normal Form

A finite n-person game is a tuple:

```text
(N, A, u)
```

where:

- `N` is the set of players.
- `A = (A1, ..., An)` where `Ai` is the action set of player `i`.
- `u = (u1, ..., un)` where `ui` is player `i`'s utility function over action profiles.

## Slide 9: Prisoner's Dilemma

Two prisoners are interrogated separately.

Payoff matrix:

| | C | D |
| --- | --- | --- |
| C | 3, 3 | 0, 5 |
| D | 5, 0 | 1, 1 |

Interpretation:

- `C`: cooperate
- `D`: defect

## Slide 10: Coordination Games

Example:

- Drivers choose left or right side of the road.
- Same side is safe.
- Different sides cause collision.

Payoff matrix:

| | L | R |
| --- | --- | --- |
| L | 1, 1 | -1, -1 |
| R | -1, -1 | 1, 1 |

## Slide 11: Battle of the Sexes

A man and woman share a TV:

- Man prefers sport.
- Woman prefers movie.

Payoff matrix:

| | S | M |
| --- | --- | --- |
| S | 1, 0 | -1, -1 |
| M | -1, -1 | 0, 1 |

## Slide 12: Matching Pennies

Each player flips a coin.

- One player wins if coins match.
- The other wins if they do not match.

Payoff matrix:

| | H | T |
| --- | --- | --- |
| H | 1, -1 | -1, 1 |
| T | -1, 1 | 1, -1 |

## Slide 13: Nash Equilibria

Definitions:

- A strategy is a player's action.
- A best response is an action that maximizes utility given other players' actions.
- A profile is a Nash equilibrium if every player's action is a best response to the other players' actions.

A game may have:

- No pure Nash equilibrium.
- One Nash equilibrium.
- Multiple Nash equilibria.

## Slide 14: Mixed Strategies

A mixed strategy is a probability distribution over actions.

Expected utility is computed over all action profiles weighted by their probabilities.

Nash theorem:

- Every finite game has a mixed Nash equilibrium.

## Slide 15: Zero-Sum Games

A two-person game is zero-sum if:

```text
u1(a, b) + u2(a, b) = 0
```

In a zero-sum game:

- What is good for one player is bad for the other.
- Nash equilibrium payoffs are unique.

## Slide 16: Tic-Tac-Toe as a Zero-Sum Game

Tic-tac-toe:

- Board has nine squares.
- Player X moves first.
- Players alternate.
- A player wins by getting three in a line.

Question:

- How can tic-tac-toe be formulated as a normal-form zero-sum game?

## Slide 17: Games as Search Problems

For two-player games, a decision-making agent treats the other player as an opponent.

Sources of uncertainty:

- Opponent action is unknown.
- Search is time-bounded.

Game search formulation:

- Initial state
- Operators: legal moves
- Terminal test
- Utility function

## Slide 18: Game Tree for Tic-Tac-Toe

The slide shows a game tree:

- MAX is player X.
- MIN is player O.
- Terminal utilities are `-1`, `0`, or `+1`.

## Slide 19: Minimax with Perfect Decisions

Minimax algorithm:

1. Expand the entire tree below the current node.
2. Evaluate terminal nodes using the utility function.
3. Work upward:
   - MIN nodes take the minimum child value.
   - MAX nodes take the maximum child value.

## Slide 20: Minimax Example

MAX chooses the move with maximum utility assuming MIN will act to minimize it.

Main point:

- The value of a move depends on the best response of the opponent.

## Slide 21: Imperfect Decisions

Perfect minimax is often impractical because complete game trees are too large.

Two modifications:

- Partial tree search using a cutoff test.
- Evaluation function instead of terminal utility.

## Slide 22: Minimax with Imperfect Decisions

Algorithm:

1. Expand the tree only to a cutoff depth or condition.
2. Evaluate leaf nodes using an evaluation function.
3. Propagate values upward using minimax.

## Slide 23: Evaluation Functions

An evaluation function estimates expected utility from a game position.

Requirements:

- Efficient to compute.
- Agrees with utility function on terminal states.
- Accurately reflects chances of winning.

Common form:

```text
w1*f1 + w2*f2 + ... + wn*fn
```

where `fi` are features and `wi` are weights.

## Slide 24: Tic-Tac-Toe Evaluation Function

For position `p`:

- If neither player has won, `e(p)` is the number of open lines for MAX minus the number of open lines for MIN.
- If MAX wins, `e(p) = infinity`.
- If MIN wins, `e(p) = -infinity`.

## Slides 25-27: Tic-Tac-Toe Search Stages

These slides illustrate minimax search with imperfect decisions on tic-tac-toe.

They show:

- First stage of search
- Second stage of search
- Last stage of search

Symmetric positions are eliminated.

## Slide 28: Partial Tree Search

Approaches:

- Depth-limited search
- Iterative deepening search
- Quiescent search

Quiescent search expands unstable positions until reaching positions unlikely to have large evaluation changes soon.

## Slide 29: Pruning

Pruning eliminates a branch of the search tree without examining it.

General idea:

- If one option is already known to be better for a player, alternatives that cannot improve the result can be ignored.

## Slide 30: Alpha-Beta Pruning

Alpha-beta pruning reduces the number of nodes evaluated by minimax.

Effectiveness depends on successor ordering.

Main point:

- Alpha-beta returns the same minimax value while avoiding unnecessary branches.

## Slide 31: Alpha-Beta Search - Informal

To evaluate a MAX node:

1. Expand depth-first until a cutoff node.
2. Evaluate the cutoff node.
3. Update MAX alpha values and MIN beta values.
4. Prune:
   - Children of MIN nodes when beta is no greater than an alpha ancestor.
   - Children of MAX nodes when alpha is no less than a beta ancestor.

## Slide 32: Alpha-Beta Example

The slide shows part of tic-tac-toe alpha-beta search.

Main point:

- Once bounds prove that a branch cannot affect the final decision, it can be pruned.

## Slide 33: Alpha-Beta Search Algorithm

The algorithm uses two mutually recursive functions:

- `MAX-VALUE(state, game, alpha, beta)`
- `MIN-VALUE(state, game, alpha, beta)`

Each function:

- Checks cutoff.
- Recursively evaluates successors.
- Updates alpha or beta.
- Returns early when pruning is possible.

## Slide 34: Analysis of Game-Playing Algorithms

Alpha-beta effectiveness depends on move ordering.

With optimal ordering, alpha-beta can reduce the effective branching factor from `b` to approximately `sqrt(b)`.

All discussed game-playing algorithms assume the opponent plays optimally.

## Slide 35: Monte Carlo Search

Pure Monte Carlo search:

1. Expand the current node.
2. For each child, play many random games to the end.
3. Compute average payoffs.
4. Choose the child with the largest average value.

## Slide 36: Monte Carlo Tree Search

MCS can be used by:

- Using formulas other than simple averages.
- Combining with alpha-beta pruning.
- Using domain knowledge and learning techniques.

## Slide 37: Monte Carlo Search Example

Averages can be misleading.

The slide shows a case where minimax would choose one branch, while averaging would choose another.

## Slide 38: Monte Carlo Search with UCB

Upper confidence bound:

```text
UCB(M_i) = mu_i + c * sqrt(log N / N_i)
```

where:

- `mu_i` is the expected value for child `M_i`.
- `N_i` is the number of plays for child `M_i`.
- `N` is the total number of plays for the parent.
- `c` is the exploration parameter.

## Slide 39: Monte Carlo Tree Search

MCTS:

- Starts building a tree.
- Uses Monte Carlo search with UCB scoring.
- Propagates values up the tree.

## Slide 40: State of the Art

Examples:

- Deep Blue defeated Garry Kasparov in chess in 1997.
- Chinook became world champion in checkers in 1994.
- AlphaGo defeated a top Go player in 2016.

## Slide 41: Auctions

Auctions matter because:

- They are widely used in consumer, corporate, and computer science settings.
- They provide a theoretical framework for resource allocation among self-interested agents.

An auction determines:

- Allocation of resources.
- Payments by agents.

## Slide 42: Single-Item Auctions

Examples:

- English auction
- Japanese auction
- Dutch auction
- Sealed-bid auction

In sealed-bid auctions, agents submit bids secretly and the protocol determines the winner.

## Slide 43: Auctions as Structured Negotiations

Auction rules include:

- Bidding rules: how offers are made.
- Clearing rules: when trades occur and who pays what.
- Information rules: who knows what and when.

## Slide 44: Sealed-Bid Auctions

First-price auction:

- Highest bidder wins.
- Winner pays their own bid.

Second-price auction:

- Highest bidder wins.
- Winner pays the second-highest bid.

Question:

- How should agents bid?

## Slide 45: First-Price Auction as a Game

Common-knowledge values:

- Agents bid values in `[0, 1]`.
- If agent `i` wins, utility is `v_i - x_i`.
- Otherwise utility is 0.

Questions:

- Does tie-breaking matter?
- What are the Nash equilibria?

## Slide 46: Second-Price Auction as a Game

In a second-price auction:

- Highest bidder wins.
- Winner pays the second-highest bid.

Question:

- What are the Nash equilibria?

## Slide 47: First-Price Auction with Same Value

Assumptions:

- One item.
- First-price mechanism.
- Ties broken randomly.
- `N` bidders.
- Each bidder has value 1.
- Bids come from a fixed set `P`.

## Slide 48: Case 1

For two bidders and bid set `{0, 1}`:

| | 0 | 1 |
| --- | --- | --- |
| 0 | 0.5, 0.5 | 0, 0 |
| 1 | 0, 0 | 0, 0 |

There are two Nash equilibria:

- `(0, 0)`
- `(1, 1)`

## Slide 49: Generalization

For two bids `0 <= a < b <= 1`:

- `(b, b)` is always a Nash equilibrium.
- `(a, a)` is a Nash equilibrium iff `(1 - a)/2 >= 1 - b`.
- Mixed bid profiles with different bids are generally not Nash equilibria.

Some parameter choices yield a prisoner's dilemma structure.

## Slide 50: General First-Price Case

For `n >= 2` players and bid levels:

```text
0 <= a1 < ... < am <= 1
```

The all-highest-bid profile `(am, ..., am)` is always a Nash equilibrium.

If players can bid on a continuous closed interval, the unique Nash equilibrium is the all-upper-bound bid profile.

If the upper bound is open, there is no Nash equilibrium.

## Slide 51: Auctions as Games with Private Values

In realistic auctions:

- Agents do not know each other's valuations.
- Each agent's value is private information.
- Uncertainty is modeled with probabilities.

## Slide 52: Auctions as Bayesian Games

A sealed single-item auction includes:

- A set of agents.
- Private values for each agent.
- Possible bids.
- A common prior over value profiles.
- A payment function.
- A winner selection function.

A strategy maps private values to bids.

Expected utility is computed over private value distributions.

## Slide 53: Nash Equilibria for Auctions

For second-price auctions:

- The Nash equilibrium is to bid one's true valuation.

For first-price auctions with independent uniform valuations:

```text
bid_i = v_i * (n - 1) / n
```

is a Nash equilibrium.

## Slide 54: Revenue Equivalence

Vickrey's revenue equivalence theorem:

Auctions yield the same expected seller revenue when:

- The highest-valuation bidder always wins.
- The lowest possible valuation bidder expects zero payoff.
- All bidders are risk-neutral.
- Valuations are drawn from a strictly increasing atomless distribution.

## Slide 55: Iterated Prisoner's Dilemma

General form:

| | Cooperate | Defect |
| --- | --- | --- |
| Cooperate | R, R | S, T |
| Defect | T, S | P, P |

Conditions:

```text
T > R > P > S
2R > T + S
```

For a known finite number of rounds, the dominant Nash equilibrium is to defect.

## Slide 56: Axelrod Tournament

Rules:

- Programs play each other for an unknown number of rounds.
- Each program can use interaction history.

Round one:

- 14 entries plus RANDOM.
- Winner: Tit for Tat by Anatol Rapoport.

Tit for Tat:

- Cooperate on the first move.
- Then play whatever the opponent played last time.

## Slide 57: References

Reference:

- Robert Axelrod. *The Evolution of Cooperation*. Basic Books, 1984.

Strategy list:

- <http://www.iterated-prisoners-dilemma.net/prisoners-dilemma-strategies.shtml>

## Slide 58: Formal Properties

Future encounters may be discounted by a weight `w`, where:

```text
0 <= w <= 1
```

The weight can also be interpreted as the probability of playing the opponent again.

Proposition:

- If `w` is sufficiently large, there is no strategy that is best against all possible opponent strategies.

## Slide 59: More Properties

Tit for Tat is robust across many environments.

Definitions:

- A strategy is collectively stable if no other strategy can invade it.
- A strategy is nice if it does not defect first.

Properties:

- Tit for Tat is collectively stable iff the discount weight is large enough.
- All Defect is always collectively stable.
- All Defect can still be invaded by a cluster of individuals.
