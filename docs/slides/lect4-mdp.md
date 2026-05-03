# CSIT5900 Lecture 4: Markov Decision Process and Reinforcement Learning

Source PDF: `lect4-mdp.pdf`  
Extracted text source: `tmp/pdfs/ai-slides-text/lect4-mdp.txt`  
Pages: 57  
Status: cleaned slide text for EduMind ingestion.

## Slide 1: Title

CSIT5900 Lecture 4: Markov Decision Process and Reinforcement Learning

Department of Computer Science and Engineering  
Hong Kong University of Science and Technology

## Slide 2: Nondeterministic Actions

Many decision problems involve chance:

- Backgammon
- Blackjack
- Russian roulette

Examples:

- One-shot decision: take `$100`, or flip a coin to either get `$400` or lose `$200`.
- Airport decision: choose taxi or public transportation under uncertainty about delay, cost, and deadline.
- Uncertainty can come from the action itself or from the environment.

## Slide 3: Planning Under Uncertainty

Example:

- You are on floor 0.
- Goal: reach floor 6.
- Action 1: walk up one floor, always succeeds.
- Action 2: roll a die. With probability `0.5`, move up `k` floors, where `k` is the die result. With probability `0.5`, stay where you are.

Question:

- If the goal is to minimize time, what is the best plan?

## Slide 4: Search Problems and MDPs

A search problem contains:

- States
- Starting state
- Actions that map states to states
- Goal condition
- Cost function

In a Markov decision process:

- Actions are indeterminate.
- The cost or reward can depend on the starting state, action, and ending state.

## Slide 5: MDP Definition

An MDP consists of:

- A set of states
- A starting state
- A set of actions
- A probabilistic transition relation `T(s, a, s')`
- A reward function `Reward(s, a, s')`
- A goal or terminal condition `End(s)`
- A discount factor `0 <= gamma <= 1`

## Slide 6: A Dice Game

At each round, choose:

- `quit`: get `$10`.
- `stay`: get `$4`, then roll a six-sided die. If it is 1 or 2, the game ends. Otherwise, continue to the next round.

## Slide 7: Dice Game MDP Formulation

States:

- `in`: start of the game.
- `out`: end of the game.

Other components:

- Starting state: `in`.
- `End(s)` iff `s = out`.
- Actions: `quit`, `stay`.

Transitions:

```text
T(in, quit, out) = 1
T(in, stay, out) = 2/6
T(in, stay, in) = 4/6
T(out, x, out) = 1
```

Rewards:

```text
Reward(in, quit, out) = 10
Reward(in, stay, in) = 4
Reward(in, stay, out) = 4
```

## Slide 8: Transitions

The transition probability `T(s, a, s')` specifies the probability of ending in state `s'` after doing action `a` in state `s`.

If `T(s, a, s') != 0`, then `s'` is a possible successor.

For each state-action pair:

```text
sum over s' of T(s, a, s') = 1
```

## Slide 9: Policies

An MDP solution must specify what action to take in every possible situation.

A policy `pi` is a mapping from states to actions.

Example:

```text
pi(s) = stay if s = in
pi(s) = nil otherwise
```

Here `nil` is a no-op action added so policies are functions.

## Slide 10: Evaluating a Policy

Policies are compared using expected utility.

For a run:

```text
in, stay, 4, in, stay, 4, out
```

The utility is the discounted sum of rewards:

```text
4 + gamma * 4
```

A policy may generate infinitely many possible runs.

## Slide 11: Value Function Recurrence

Given a policy `pi`, let `V_pi(s)` be the expected utility of following `pi` in state `s`.

```text
V_pi(s) = 0, if End(s)
V_pi(s) = sum_s' T(s, pi(s), s') *
          [Reward(s, pi(s), s') + gamma * V_pi(s')], otherwise
```

## Slide 12: Q-Value Recurrence

Definitions:

- `V_pi(s)`: expected utility of following policy `pi` in state `s`.
- `Q_pi(s, a)`: expected utility of doing action `a` in `s`, then following `pi`.

Recurrences:

```text
V_pi(s) = 0, if End(s)
V_pi(s) = Q_pi(s, pi(s)), otherwise

Q_pi(s, a) = sum_s' T(s, a, s') *
             [Reward(s, a, s') + gamma * V_pi(s')]
```

## Slide 13: Policy Evaluation Example

For the dice game with policy `pi(in) = stay` and discount factor `gamma = 1`:

```text
V_pi(out) = 0
V_pi(in) = 2/3 * (4 + V_pi(in)) + 1/3 * (4 + 0)
```

Solving gives:

```text
V_pi(in) = 12
```

## Slide 14: Iterative Policy Evaluation

In the general case, a closed-form solution may not exist.

Iterative policy evaluation:

```text
initialize V_pi^0(s) = 0 for all states
for t = 1 to Max:
    for each state s:
        V_pi^t(s) = sum_s' T(s, pi(s), s') *
                    [Reward(s, pi(s), s') + gamma * V_pi^(t-1)(s')]
```

Stop when values change very little.

## Slide 15: Optimal Policy and Value Function

Policy evaluation computes values for a given policy.

An optimal policy `pi_opt` satisfies:

```text
V_pi_opt(s) >= V_pi'(s)
```

for every state `s` and every policy `pi'`.

The optimal value function is:

```text
V*(s) = max_pi V_pi(s) = V_pi_opt(s)
```

## Slide 16: Policy Iteration

Policy iteration:

1. Initialize `pi` to a random policy.
2. Repeat:
   - Improve `pi` using a successor policy.

The key operation is policy improvement.

## Slide 17: Policy Improvement

Given a policy `pi`, compute:

- `V_pi(s)` for every state.
- `Q_pi(s, a)` for every state and action.

Define a new policy:

```text
pi_new(s) = arg max_a Q_pi(s, a)
```

This policy is at least as good as the old policy and often better.

## Slide 18: Policy Improvement Example

For the dice game:

- Current policy: `pi(in) = quit`
- Discount factor: `gamma = 1`

Values:

```text
V_pi(in) = 10
V_pi(out) = 0
Q_pi(in, quit) = 10
Q_pi(in, stay) = 4 + 2/3 * 10 > 10
```

Therefore:

```text
pi_new(in) = stay
```

## Slide 19: Value Iteration

Optimal values can be computed directly:

```text
V*(s) = 0, if End(s)
V*(s) = max_a Q_opt(s, a)

Q_opt(s, a) = sum_s' T(s, a, s') *
              [Reward(s, a, s') + gamma * V*(s')]
```

## Slide 20: Bellman Value Iteration

Value iteration:

```text
initialize V^0(s) = 0 for all states
for t = 1 to Max:
    for each state s:
        V^t(s) = max_a sum_s' T(s, a, s') *
                 [Reward(s, a, s') + gamma * V^(t-1)(s')]
```

## Slide 21: Convergence

Convergence theorem:

If either:

- The discount factor `gamma < 1`, or
- The MDP graph is acyclic,

then both value iteration and policy iteration converge to the correct answer.

## Slide 22: Reinforcement Learning

If the MDP is known, policy iteration or value iteration can compute an optimal policy.

Reinforcement learning is needed when:

- The transition distribution is unknown.
- The transition distribution is known conceptually but too hard to write down.
- The agent must learn through interaction.

## Slide 23: RL Discussion

Discussion questions:

- Can an optimal controller be learned using RL for the boundary-following robot?
- What are examples of reinforcement learning?
- Blackjack is used as a discussion example.

## Slide 24: RL General Considerations

Goal:

- Learn a policy that maximizes rewards.

Given:

- A set of actions available in each state.

Questions:

1. How is a policy represented?
2. Which action should be tried in the current state?
3. After an action is taken and reward is received, how should the current policy be updated?

## Slide 25: RL General Framework

RL framework:

1. Initialize.
2. Loop:
   - Collect data by executing the policy and recording results.
   - Update the model to get a better policy.

The learned model may be:

- The transition relation
- Q-values
- The policy directly

## Slide 26: Exploration vs. Exploitation

Given the current knowledge:

- Exploitation: choose the best known action.
- Exploration: try actions that are unknown or previously poor.

Unless the agent has a perfect model, both are necessary.

## Slide 27: Epsilon-Greedy

Epsilon-greedy policy:

```text
pi(s) = arg max_a Q_hat(s, a), with probability 1 - epsilon
pi(s) = random action,        with probability epsilon
```

This balances exploitation and exploration.

## Slide 28: Representation

How the agent updates parameters depends on representation.

Options:

- Tabular representation: transitions, rewards, values, Q-values, and policies are tables.
- Approximation: efficient functions such as neural networks represent these quantities.

Deep reinforcement learning uses approximation with neural networks.

## Slide 29: Monte Carlo Method - Model Estimation

Main idea:

- Estimate quantities by taking averages over samples.

Sample data:

```text
D = [s1, a1, r1, s2, a2, r2, s3, ...]
```

Estimate transitions:

```text
T_hat(s, a, s') = count(s, a, s') / sum_s'' count(s, a, s'')
```

Estimate rewards by averaging observed rewards for the same transition.

## Slide 30: Monte Carlo Method - Q-Values

For a trajectory:

```text
D = [s1, a1, r1, s2, a2, r2, s3, ...]
```

Utility at time `i`:

```text
u_i = r_i + gamma*r_(i+1) + gamma^2*r_(i+2) + ...
```

Estimate:

```text
Q_hat_pi(s, a) = average of u_t where s_t = s and a_t = a
```

## Slide 31: Temporal Difference Learning

Monte Carlo methods require a complete episode before updating.

Temporal difference methods:

- Use current knowledge.
- Update after every transition.

A prominent temporal difference method is Watkins' Q-learning.

## Slide 32: Q-Learning

Given an observed transition `(S, A, r, S')`, update:

```text
Q_hat(S, A) = (1 - mu) * Q_hat(S, A)
              + mu * (r + gamma * V_hat(S'))
```

where:

```text
V_hat(S') = max_a Q_hat(S', a)
```

Parameters:

- `mu`: learning rate
- `gamma`: discount factor

## Slide 33: Deep Q-Learning

When the number of states is very large, tabular Q-values are not efficient.

Deep Q-learning represents the Q-function using a neural network.

Example reference:

- Mnih et al. "Playing Atari with Deep Reinforcement Learning" (2013)

## Slide 34: DQN Network - Direct Encoding Issue

A Q-value function has two parameters:

- State
- Action

A naive network that takes both state and action as input may be inefficient when there are many actions and states.

## Slide 35: DQN Network - Better Encoding

A common DQN encoding:

- Input: state
- Output: one Q-value for each possible action

This gives uniform encoding for both inputs and outputs.

## Slide 36: DQN Loss

Training a DQN requires:

- Data
- Backpropagation
- Gradient descent
- A loss function

The key question is how to define labels for Q-values.

## Slide 37: DQN Online Q-Learning

Data format:

```text
(S, A, S', R)
```

Label:

```text
y = R + gamma * max_a Q_phi(S', a)
```

where `Q_phi` is the current Q-network.

Issue:

- The target changes as the network changes.

## Slide 38: DQN Moving Target

The label should be stable, not a moving target.

DQN addresses this by using techniques such as a separate target network, generalizing tabular Q-learning to neural networks.

## Slide 39: Policy Gradients

Question:

- If the goal is a policy, why not represent the policy directly instead of going through a Q-function?

Topics:

- Policy represented by a neural network
- Policy gradient learning
- PPO
- GRPO

References include Williams (1992), Schulman et al. (2017), DeepSeekMath (2024), Sergey Levine's policy gradient slides, and Jan Peters' Scholarpedia article.

## Slide 40: Stochastic Policies

A deterministic policy maps states to actions.

A stochastic policy maps states to probability distributions over actions.

Examples:

```text
pi(in) = {(stay, 0.8), (quit, 0.2)}
```

## Slide 41: Need for Stochastic Policies

In theory:

- No stochastic policy is needed for MDP optimality, because an optimal deterministic policy exists.

In practice:

- Stochastic policies are useful when there are too many actions or states.
- Deterministic good policies may be undesirable.
- LLM next-token generation can be viewed as stochastic action selection.

## Slide 42: Value of a Stochastic Policy

A stochastic policy is written as:

```text
pi(a | s)
```

The probability of a run:

```text
p(tau) = product_i pi(a_(i+1) | s_i) * T(s_i, a_(i+1), s_(i+1))
```

The value of the policy is the expected discounted reward over possible runs.

## Slide 43: Notes from Policy Gradient Lectures

The following slides adapt notes from Sergey Levine's policy gradient lecture.

Differences from the course notation:

- Rewards are binary in Levine's notes.
- Transition probabilities are written as conditional probabilities.
- Discount factor is assumed to be 1.
- Policy is represented by a neural network with parameters `theta`.

## Slides 44-49: Policy Gradient Objective

These slides cover:

- The goal of reinforcement learning in finite and infinite horizon cases.
- Evaluating the objective.
- Direct policy differentiation.
- Estimating policy gradients from samples.
- Running the policy, estimating returns, and improving the policy.

## Slide 50: PPO Motivation

Problem with REINFORCE:

- It can cause destructively large policy updates.

PPO solution:

- Avoid updates that change the policy too much.

## Slide 51: PPO Objective Function

Key terms:

- Probability ratio `r_t(theta)`: compares current policy probability with old policy probability.
- Advantage estimate `A_hat_t`: measures how much better an action is than average.
- Clip function: limits the ratio to a range.

PPO clipped surrogate objective:

```text
L_clip(theta) = E_t[
    min(
        r_t(theta) * A_hat_t,
        clip(r_t(theta), 1 - epsilon, 1 + epsilon) * A_hat_t
    )
]
```

The objective is a technical surrogate for gradient-based policy learning.

## Slide 52: PPO Algorithm

The slide shows the PPO algorithm from the PPO paper.

Main idea:

- Collect trajectories.
- Estimate advantages.
- Optimize the clipped surrogate objective.
- Repeat.

## Slide 53: GRPO

PPO is expensive because it uses a critic model to estimate advantage.

GRPO, or Group Relative Policy Optimization, samples a group of outputs, computes their rewards, and compares each reward to the group average.

This avoids using a large critic model.

Reference:

- DeepSeekMath, 2024.

## Slide 54: Aligning LLMs with RLHF

LLM training stages:

1. Pretraining
2. Instruction tuning
3. Alignment

Alignment is often done using reinforcement learning from human feedback.

## Slide 55: RLHF

The slide gives a high-level description of RLHF from the original RLHF paper.

Typical pipeline:

1. Collect human preference data.
2. Train a reward model.
3. Optimize the policy using reinforcement learning.

## Slide 56: RLHF Reward Model

Reward model:

- A transformer model takes a prompt and response.
- It outputs a scalar reward.

Training:

- Human preference data contains pairs of responses.
- The model is trained so preferred responses receive higher reward.

The loss is similar to logistic regression over pairwise preferences.

## Slide 57: Take-Home Message

For reinforcement learning, think carefully about:

- What the episodes are.
- What the rewards are.
- What behavior the RL system is being trained to learn.
