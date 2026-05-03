# CSIT5900 (L1) - Artificial Intelligence Lecture Slides

Status: lecture slide material prepared for EduMind project demonstration.

Course: Artificial Intelligence  
Course code: CSIT5900 (L1)  
Source type: lecture slides  
Related syllabus: [Artificial Intelligence Syllabus](./artificial-intelligence-syllabus.md)

## 1. Source Documents

| Lecture | File | Title | Pages | Main Topic |
| ---: | --- | --- | ---: | --- |
| 1 | `lect1-intro.pdf` | CSIT5900 Lecture 1: Introduction | 12 | AI overview, history, course objectives |
| 2 | `lect2-agents.pdf` | CSIT5900 Lecture 2: Designing Agents | 36 | Reactive agents, production systems, TLU, GP, LLM agents |
| 3 | `lect3-search.pdf` | CSIT5900 Lecture 3: Agents that Search | 34 | Search problems, BFS, DFS, A*, heuristics, hill climbing |
| 4 | `lect4-mdp.pdf` | CSIT5900 Lecture 4: Markov Decision Process and Reinforcement Learning | 57 | MDP, policy/value iteration, RL, Q-learning, DQN, PPO, RLHF |
| 5 | `lect5-kr.pdf` | CSIT5900 Knowledge Representation, Reasoning and Constraint Satisfaction Problems | 60 | Propositional logic, resolution, SAT, CSP, FOL, rule learning |
| 6 | `games.pdf` | CSIT5900 Game Theory, Game Tree Search, and Auction | 59 | Multi-agent systems, game theory, minimax, auctions, iterated prisoner's dilemma |

## 2. Lecture 1: Introduction

Source file: `lect1-intro.pdf`  
Pages: 12

### Summary

This lecture introduces artificial intelligence as the science and engineering of building intelligent machines and programs. It frames AI through three perspectives: the long-term goal of building systems that can sense, think, and act intelligently, the techniques developed by AI research, and the broader impact of AI on science, engineering, daily life, and society.

The lecture also covers the course objectives, high-level syllabus, historical starting points of AI, and examples of influential AI systems.

### Key Topics

- Definition of artificial intelligence
- AI as frontier computer application
- AI long-term goal: sense, think, and act intelligently
- AI techniques and algorithms
- Course objectives
- Course syllabus overview
- Ada Lovelace and the Analytical Engine
- Alan Turing and machine intelligence
- Dartmouth Conference and the term "artificial intelligence"
- Influential AI systems
- Generative AI as a new problem-solving methodology

### Important Examples

- Calculator, ChatGPT, operating systems, and editors as discussion cases for what counts as AI
- Ada Lovelace's note on Babbage's Analytical Engine
- Alan Turing's 1950 question about whether machines can think
- Dartmouth Conference proposal
- Marvel, Pegasus, Deep Blue, AlphaGo, IBM Watson, BERT, GPT-3, AlphaFold, ChatGPT, and later AI systems

### EduMind Extraction Targets

Concepts:

- Artificial intelligence
- Intelligent machine
- AI methodology
- Heuristic search
- Knowledge representation
- Machine learning
- Generative AI
- Turing test
- Dartmouth Conference

Possible questions:

- Explain the long-term goal of AI.
- Distinguish AI techniques from AI applications.
- Describe why the Dartmouth Conference is historically important.
- Give examples of influential AI systems and identify the AI techniques they demonstrate.

## 3. Lecture 2: Designing Agents

Source file: `lect2-agents.pdf`  
Pages: 36

### Summary

This lecture introduces agents as autonomous entities that perceive an environment, take actions, and pursue goals. It focuses on reactive or stimulus-response agents whose internal states are closely tied to their current sensor inputs.

The running example is a boundary-following robot in a grid world. The lecture uses this example to explain sensors, actions, state representation, supervised learning with threshold logic units, production systems, genetic programming, LLM-written action functions, and memory-enhanced agents with limited sensors.

### Key Topics

- Agent definition
- Perception, action, and goals
- Agent capabilities and controller behavior
- Reactive agents
- Boundary-following robot
- Binary sensors and discrete actions
- Supervised learning for action functions
- Threshold logic units and perceptrons
- Linearly separable Boolean functions
- Error-correction learning rule
- Activation functions
- Artificial neural networks
- Production systems
- Perceptual processing and feature extraction
- Boolean algebra for action conditions
- Genetic programming
- Fitness functions
- Crossover, mutation, and selection
- LLM-written action functions
- Sensor-impaired agents
- Memory and internal state

### Important Examples

- Grid-world boundary-following robot
- Learning when to move east from sensory vectors
- TLU as a simple neuron model
- Production-system rules for wall following
- Genetic programming over tree-structured programs
- Sensor-impaired robot using memory-derived features

### EduMind Extraction Targets

Concepts:

- Agent
- Reactive agent
- Sensor
- Action
- Controller
- State
- Perceptual processing
- Feature vector
- Threshold logic unit
- Perceptron
- Linear separability
- Error-correction procedure
- Production system
- Genetic programming
- Fitness function
- Crossover
- Mutation
- Internal memory

Possible questions:

- Define an agent in terms of perception, action, and goals.
- Explain why the boundary-following robot is a reactive agent.
- Describe how a production system maps features to actions.
- Explain why not all Boolean functions can be represented by a TLU.
- Compare supervised learning, hand-designed rules, genetic programming, and LLM-generated rules for designing agent controllers.

## 4. Lecture 3: Agents that Search

Source file: `lect3-search.pdf`  
Pages: 34

### Summary

This lecture treats problem-solving agents as agents that search through state spaces. It introduces the standard formulation of a search problem, then compares uninformed and informed search strategies.

The lecture uses the missionaries and cannibals problem, the 8-puzzle, route finding, and function maximization as examples. It covers breadth-first search, depth-first search, iterative deepening, repeated-state handling, heuristic search, A* search, admissibility, optimality, heuristic construction through relaxed problems, hill climbing, and simulated annealing.

### Key Topics

- Search problem formulation
- State space
- Initial state
- Deterministic actions
- Goal test
- Path cost
- Problem-solving agent workflow
- Search tree
- General search algorithm
- Breadth-first search
- Depth-first search
- Iterative deepening
- Repeated states and cycles
- Heuristic function
- Best-first search
- A* search
- Path cost plus heuristic cost
- Admissible heuristic
- Monotonicity
- Completeness and optimality of A*
- A* memory complexity
- Heuristic dominance
- Relaxed problem
- Function maximization
- Hill climbing
- Local maxima
- Simulated annealing

### Important Examples

- Missionaries and cannibals problem
- 8-puzzle state-space formulation
- Breadth-first and depth-first search on the 8-puzzle
- Route finding with straight-line distance to Bucharest
- A* search using path cost and heuristic estimate
- 8-puzzle heuristics: misplaced tiles and Manhattan distance
- 8-queens as function maximization
- Simulated annealing for escaping local maxima

### EduMind Extraction Targets

Concepts:

- Search problem
- State space
- Search tree
- Breadth-first search
- Depth-first search
- Iterative deepening
- Repeated state
- Heuristic function
- Best-first search
- A* search
- Admissibility
- Optimality
- Heuristic dominance
- Relaxed problem
- Hill climbing
- Simulated annealing

Possible questions:

- Formulate the 8-puzzle as a search problem.
- Compare breadth-first search and depth-first search in completeness, optimality, time, and space.
- Explain why A* is optimal under an admissible heuristic.
- Explain why Manhattan distance dominates the misplaced-tiles heuristic for the 8-puzzle.
- Describe how a relaxed problem can generate an admissible heuristic.
- Explain why hill climbing can get stuck and how simulated annealing addresses this.

## 5. Lecture 4: Markov Decision Process and Reinforcement Learning

Source file: `lect4-mdp.pdf`  
Pages: 57

### Summary

This lecture extends search to settings with nondeterministic actions and uncertainty. It introduces Markov decision processes as a framework for decision-making when actions lead to probabilistic outcomes and rewards.

The lecture then moves from known MDPs to reinforcement learning, where transition models or rewards may be unknown or difficult to specify. It covers policy evaluation, policy iteration, value iteration, convergence, exploration versus exploitation, epsilon-greedy behavior, Monte Carlo methods, temporal difference learning, Q-learning, deep Q-learning, policy gradients, PPO, GRPO, and RLHF for LLM alignment.

### Key Topics

- Nondeterministic actions
- Planning under uncertainty
- Markov decision process
- Transition probability
- Reward function
- Terminal condition
- Discount factor
- Policy
- Expected utility
- Value function
- Q-value
- Policy evaluation
- Policy improvement
- Policy iteration
- Value iteration
- Bellman update
- Convergence conditions
- Reinforcement learning
- Exploration and exploitation
- Epsilon-greedy policy
- Tabular representation
- Monte Carlo method
- Temporal difference learning
- Q-learning
- Deep Q-learning
- Policy gradients
- Stochastic policy
- PPO
- GRPO
- RLHF
- Reward model

### Important Examples

- One-shot coin-flip decision under uncertainty
- Airport transportation choice with probabilistic delays
- Dice game MDP
- Policy evaluation for always staying in the dice game
- Policy improvement from quit to stay
- Blackjack as an RL discussion example
- Atari games and DQN
- LLM token generation as a stochastic policy analogy
- RLHF reward model trained from human pairwise preferences

### EduMind Extraction Targets

Concepts:

- Markov decision process
- Transition relation
- Reward
- Discount factor
- Policy
- Value function
- Q-value
- Policy evaluation
- Policy iteration
- Value iteration
- Bellman equation
- Reinforcement learning
- Exploration
- Exploitation
- Epsilon-greedy
- Monte Carlo method
- Temporal difference
- Q-learning
- Deep Q-learning
- Policy gradient
- PPO
- GRPO
- RLHF
- Reward model

Possible questions:

- Define an MDP and explain each component.
- Explain why an MDP solution is a policy rather than a single action sequence.
- Compute or describe policy evaluation for a simple MDP.
- Compare policy iteration and value iteration.
- Explain the exploration-exploitation tradeoff.
- Explain the Q-learning update and the role of learning rate and discount factor.
- Describe why DQN uses states as input and Q-values for actions as output.
- Explain the motivation for PPO's clipped objective.
- Describe how RLHF uses a reward model trained from human preferences.

## 6. Lecture 5: Knowledge Representation, Reasoning, and CSPs

Source file: `lect5-kr.pdf`  
Pages: 60

### Summary

This lecture introduces knowledge-based agents and formal reasoning. It begins with logical reasoning examples, including the tiger-or-cat puzzle, ranking puzzle, Wumpus World, and reasoning about other agents' knowledge.

The lecture then develops propositional logic, including syntax, semantics, truth assignments, entailment, tautologies, CNF conversion, resolution, proof by refutation, SAT, CSPs, constructive search, constraint propagation, DPLL, modern SAT solving, GSAT, heuristic repair, unsupervised clustering as a CSP-style problem, K-means, first-order logic, rule-based expert systems, and rule learning.

### Key Topics

- Knowledge-based agents
- Knowledge base
- Reasoning and inference
- Knowledge representation language
- Syntax and semantics
- Propositional logic
- Truth assignment
- Entailment
- Tautology
- Deduction theorem
- CNF
- Clause
- Literal
- Resolution
- Refutation proof
- Satisfiability
- SAT and 3SAT
- Constraint satisfaction problem
- Constructive methods
- Constraint propagation
- Constraint graph
- DPLL
- Conflict-driven clause learning
- GSAT
- Heuristic repair
- Min-conflicts
- Unsupervised learning
- Clustering
- K-means
- First-order logic
- Predicate, function, constant, term, sentence
- Universal and existential quantification
- Rule-based expert systems
- Horn clauses
- Rule learning
- Generic separate-and-conquer algorithm

### Important Examples

- Tiger-or-cat room puzzle
- Ranking puzzle with Lisa, Bob, Jim, and Mary
- Wumpus World safety reasoning
- Dirty forehead reasoning puzzle
- Legal evidence example in propositional logic
- Mail delivery entailment example
- Graph coloring as model finding
- CNF conversion example
- Resolution proof for `Girl`
- SAT and DPLL
- 4-queens and 8-queens CSPs
- Brown word clustering
- Image clustering
- K-means with one-dimensional examples
- First-order logic mushroom examples
- Loan approval expert system
- Rule learning from bank records

### EduMind Extraction Targets

Concepts:

- Knowledge base
- Logical inference
- Propositional logic
- Syntax
- Semantics
- Truth assignment
- Entailment
- Tautology
- CNF
- Resolution
- Proof by refutation
- SAT
- CSP
- Constraint propagation
- DPLL
- Conflict-driven clause learning
- GSAT
- Min-conflicts
- Clustering
- K-means
- First-order logic
- Quantifier
- Horn clause
- Expert system
- Rule learning

Possible questions:

- Explain the difference between syntax and semantics in a logic.
- Translate a natural-language statement into propositional logic.
- Define entailment and tautology.
- Convert a simple formula into CNF.
- Explain how resolution proves entailment by refutation.
- Formulate 8-queens as a CSP.
- Compare constructive CSP methods and heuristic repair methods.
- Explain the role of unit clauses and pure literals in DPLL.
- Explain why first-order logic is more concise than propositional logic.
- Learn a simple rule from tabular examples using separate-and-conquer reasoning.

## 7. Lecture 6: Game Theory, Game Tree Search, and Auction

Source file: `games.pdf`  
Pages: 59

### Summary

This lecture introduces multi-agent systems and strategic interaction among rational or self-interested agents. It begins with normal-form game theory and Nash equilibrium, then connects zero-sum games to game-tree search.

The lecture covers minimax, imperfect decision-making with cutoff search and evaluation functions, alpha-beta pruning, Monte Carlo search, Monte Carlo tree search, auctions as structured negotiations and Bayesian games, revenue equivalence, and iterated prisoner's dilemma.

### Key Topics

- Multi-agent systems
- Agent communication, cooperation, and adversity
- Game theory
- Preference
- Utility function
- Normal-form game
- Pure strategy
- Mixed strategy
- Best response
- Nash equilibrium
- Zero-sum game
- Game tree
- Minimax
- Terminal utility
- Cutoff test
- Evaluation function
- Partial tree search
- Quiescent search
- Pruning
- Alpha-beta pruning
- Monte Carlo search
- Upper confidence bound
- Monte Carlo tree search
- Auctions
- English, Japanese, Dutch, and sealed-bid auctions
- First-price auction
- Second-price auction
- Auction as Bayesian game
- Revenue equivalence
- Iterated prisoner's dilemma
- Tit for Tat
- Collective stability

### Important Examples

- Shared network downloading example
- Prisoner's dilemma
- Coordination game
- Battle of the Sexes
- Matching pennies
- Tic-tac-toe as a zero-sum game
- Minimax search over tic-tac-toe game trees
- Alpha-beta pruning example
- Chess, checkers, and Go game-playing systems
- Single-item auctions
- First-price and second-price sealed-bid auctions
- Bayesian auction model
- Axelrod's computer prisoner's dilemma tournament

### EduMind Extraction Targets

Concepts:

- Multi-agent system
- Game theory
- Utility
- Normal-form game
- Strategy
- Best response
- Nash equilibrium
- Mixed strategy
- Zero-sum game
- Minimax
- Evaluation function
- Alpha-beta pruning
- Monte Carlo search
- Monte Carlo tree search
- Auction
- First-price auction
- Second-price auction
- Bayesian game
- Revenue equivalence
- Iterated prisoner's dilemma
- Tit for Tat

Possible questions:

- Define a finite normal-form game.
- Explain Nash equilibrium using best responses.
- Compare pure and mixed strategies.
- Explain why minimax assumes an optimal opponent.
- Describe how alpha-beta pruning can reduce search without changing minimax value.
- Explain why evaluation functions are needed in large game trees.
- Compare first-price and second-price sealed-bid auctions.
- Explain why truthful bidding is a Nash equilibrium in a second-price auction.
- Describe the main idea of the Tit for Tat strategy in iterated prisoner's dilemma.

## 8. Cross-Lecture Knowledge Map

### Agent Design

- Lecture 1 introduces AI's goals and methods.
- Lecture 2 defines agents and shows several ways to design controllers.
- Lecture 3 extends agents into goal-directed search.
- Lecture 4 extends action choice to uncertain environments.

Core chain:

`AI goals -> agents -> controllers -> search -> MDP -> reinforcement learning`

### Search and Optimization

- Lecture 3 covers deterministic state-space search.
- Lecture 4 covers probabilistic decision-making with rewards.
- Lecture 5 reuses search ideas for reasoning, SAT, and CSP.
- Lecture 6 applies search to adversarial game trees.

Core chain:

`state space -> search tree -> heuristic -> A* -> CSP search -> minimax -> alpha-beta`

### Learning

- Lecture 2 introduces supervised learning, TLUs, neural networks, and genetic programming.
- Lecture 4 covers reinforcement learning and deep reinforcement learning.
- Lecture 5 covers unsupervised learning through clustering and K-means, plus rule learning.

Core chain:

`supervised learning -> rule learning -> unsupervised clustering -> reinforcement learning -> deep RL`

### Reasoning

- Lecture 5 covers symbolic reasoning with propositional and first-order logic.
- Lecture 6 covers strategic reasoning about other agents.
- Lecture 4 covers reasoning under uncertainty through MDPs and RL.

Core chain:

`knowledge base -> entailment -> resolution -> SAT/CSP -> first-order logic -> strategic reasoning`

## 9. Suggested EduMind Course Chapters

| Chapter | Suggested Title | Source Lectures |
| ---: | --- | --- |
| 1 | Introduction to AI | Lecture 1 |
| 2 | Designing Simple Agents | Lecture 2 |
| 3 | Search and Heuristics | Lecture 3 |
| 4 | Markov Decision Processes | Lecture 4 |
| 5 | Reinforcement Learning | Lecture 4 |
| 6 | Knowledge Representation and Logical Reasoning | Lecture 5 |
| 7 | Constraint Satisfaction and SAT | Lecture 5 |
| 8 | Multi-Agent Systems and Game Theory | Lecture 6 |
| 9 | Game Tree Search | Lecture 6 |
| 10 | Auctions and Strategic Interaction | Lecture 6 |

## 10. Demo Use Notes

These slide sources are useful for demonstrating:

- Course ingestion from multiple PDF files
- Automatic concept extraction
- Knowledge map construction
- Chapter-level organization
- Slide-grounded learning cards
- Quiz generation from formulas, definitions, and examples
- Weakness analysis across related concepts
- Cross-topic links between search, reasoning, learning, and multi-agent systems

Recommended first demo concepts:

- Agent
- Production system
- A* search
- Admissible heuristic
- MDP
- Policy iteration
- Q-learning
- Resolution
- CSP
- Nash equilibrium
- Minimax
- Alpha-beta pruning
