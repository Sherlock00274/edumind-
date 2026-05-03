# CSIT5900 Lecture 2: Designing Agents

Source PDF: `lect2-agents.pdf`  
Extracted text source: `tmp/pdfs/ai-slides-text/lect2-agents.txt`  
Pages: 36  
Status: cleaned slide text for EduMind ingestion.

## Slide 1: Title

CSIT5900 Lecture 2: Designing Agents

Department of Computer Science and Engineering  
Hong Kong University of Science and Technology

## Slide 2: Overview

An agent is an entity that can perform tasks autonomously in some environment.

An agent needs:

- Perception
- Actions
- A purpose or goal

Formally:

- An agent's capability is defined by its actions and states.
- An agent's behavior is defined by its controller.
- The controller should be goal-directed.

This lecture first considers reactive or stimulus-response agents, whose states are the same as their physical sensors. It studies how to control these agents using:

- Neural networks
- Hand-designed rules
- Rules learned by genetic algorithms
- Rules written by LLMs

## Slide 3: A Boundary-Following Robot

The running example is a robot in a two-dimensional grid world.

The robot senses whether the eight surrounding cells are free for it to occupy:

- `s1`, `s2`, `s3`
- `s8`, current position, `s4`
- `s7`, `s6`, `s5`

The robot may follow:

- The outside boundary of an object counterclockwise
- The inside boundary of an outer wall clockwise

## Slide 4: Sensors and Actions

States:

- All possible combinations of eight binary sensors `s1` to `s8`.
- `si = 1` if the corresponding cell is occupied.
- `si = 0` otherwise.

Actions:

1. `north`: move one cell up.
2. `east`: move one cell right.
3. `south`: move one cell down.
4. `west`: move one cell left.

Each action has its intended effect unless the robot attempts to move into an occupied cell. In that case, the action has no effect.

## Slide 5: Controlling a Robot

The problem model contains:

- An environment modeled as a two-dimensional grid world.
- An agent with sensors for nearby occupied cells.
- A set of movement actions.
- A task: follow the boundary of the first obstacle encountered.

The remaining problem is to design an algorithm to control the robot.

## Slide 6: Learning Action Functions with TLUs

One approach is to learn an action function using supervised learning with threshold logic units (TLUs).

## Slide 7: Supervised Learning

Given a training set:

- A set `Sigma` of n-dimensional vectors.
- For each vector, an associated action label.

The learning task is to compute a function that responds acceptably to the training set. Usually this means that the learned function agrees with as many training examples as possible.

The lecture considers simple linear weighted functions called threshold logic units.

## Slide 8: Example - When to Move East

Example task:

- Learn from sensory vectors when the robot should move east.
- Each input is a sensory vector.
- The label is whether the action should be `move east`.

## Slide 9: Threshold Logic Units

A threshold logic unit, also called a perceptron, computes a weighted sum:

```text
sum_i x_i w_i
```

The output is:

```text
f = 1 if sum_i x_i w_i >= theta
f = 0 otherwise
```

TLUs can implement some Boolean functions and can be implemented as programs or circuits.

## Slide 10: TLUs and Linear Separability

Not every Boolean function can be implemented as a TLU.

Boolean functions that can be implemented as TLUs are called linearly separable functions.

## Slide 11: Neurons

A TLU is a simple model of a neuron.

Biological neurons process and transmit information through electrical and chemical signals via synapses. Neural networks are formed when neurons connect to each other.

## Slide 12: Learning TLUs

A TLU is determined by:

- The number of inputs
- The weight associated with each input
- A threshold

The threshold can be treated as a weight by adding a special input whose value is always `1`.

Thus, learning a TLU becomes learning a vector of weights.

## Slide 13: The Error-Correction Procedure

Given:

- An input vector `X`
- Desired output `d`
- Actual output `f`
- Learning rate `c`

The weight update rule is:

```text
W <- W + c(d - f)X
```

Procedure:

1. Start with a random initial weight vector.
2. Choose a learning rate.
3. Iterate through the training set repeatedly until the weights become stable.

If the training set corresponds to a linearly separable Boolean function, the procedure terminates.

The number of steps depends on:

- Initial weights
- Learning rate
- Order of training examples

## Slide 14: Activation Functions

A TLU treats a neuron as either on or off.

Other activation functions are based on the weighted sum, or score, `w dot x`.

Examples:

- Linear activation: `output(x) = a + w dot x`
- ReLU activation: `output(x) = max(0, a + w dot x)`
- Logistic activation: `output(x) = 1 / (1 + exp(-a - w dot x))`

## Slide 15: Artificial Neural Networks

An artificial neural network is a directed graph whose nodes are neuron models.

- Source nodes are inputs.
- Target nodes are outputs.
- Internal nodes represent hidden features.

General training pattern:

```text
initialize w
while condition C holds:
    w = successor(w)
    update C
```

Popular update methods include gradient descent and stochastic gradient descent.

## Slide 16: Designing Action Functions with Production Systems

Another approach is to design action functions using production systems.

## Slide 17: Basic Architecture

The designer specifies a function from sensory inputs to appropriate actions.

It is often useful to split this into:

1. Perceptual processing
2. Action function

The perceptual processing stage maps raw sensory input to a feature vector. The action function maps the feature vector to an action.

## Slide 18: Perception

Eight binary sensors produce `2^8 = 256` possible raw states.

For boundary following, only four binary-valued features are needed:

- `x1`
- `x2`
- `x3`
- `x4`

Each feature is true if at least one cell in a corresponding region is occupied.

## Slide 19: Action

Given the four features, the boundary-following action function can be specified as:

- If none of the four features is `1`, move north.
- If `x1 = 1` and `x2 = 0`, move east.
- If `x2 = 1` and `x3 = 0`, move south.
- If `x3 = 1` and `x4 = 0`, move west.
- If `x4 = 1` and `x1 = 0`, move north.

The next step is to represent and implement the perception and action functions.

## Slide 20: Boolean Algebra

A Boolean function maps an n-tuple of `0` and `1` values to `{0, 1}`.

Boolean algebra represents Boolean functions using:

- `.` for AND
- `+` for OR
- `not` for negation

Examples:

- `x4` can be represented as `s1 + s8`.
- The robot moving north can be represented by a Boolean condition over features.

## Slide 21: Production Systems

A production system is a sequence of productions, or rules, of the form:

```text
c -> a
```

Meaning:

- If condition `c` is true, perform action `a`.

If multiple rules can fire, the first applicable rule is applied.

Boundary-following production system:

```text
x4 and not x1 -> north
x3 and not x4 -> west
x2 and not x3 -> south
x1 and not x2 -> east
true          -> north
```

## Slide 22: Production System for Reaching a Corner

Example production system:

```text
inCorner -> nil
true     -> bf
```

Here:

- `inCorner` detects whether the robot is in a corner.
- `nil` means do nothing.
- `bf` is the boundary-following action produced by the previous production system.

## Slide 23: Learning Action Functions with Genetic Programming

Another approach is to learn action functions with genetic programming.

## Slide 24: Machine Evolution

Evolution has two key components:

- Reproduction: how parents produce descendants.
- Survival of the fittest: how descendants are selected for further reproduction.

The lecture asks whether machines can similarly evolve into effective problem-solving programs.

## Slide 25: Genetic Programming

Genetic programming evolves programs to solve specific problems.

Main steps:

1. Decide what legal programs are.
2. Define a fitness function.
3. Select an initial generation of legal programs.
4. Produce later generations until a desired program is found.

Common techniques:

- Copying
- Crossover
- Mutation

## Slide 26: The Task

The example task is wall-following in a fixed grid-world environment.

The robot senses directions such as:

- `n`, `s`, `e`, `w`
- `ne`, `nw`, `se`, `sw`

## Slide 27: Program Representation

Programs are constructed from primitive actions and operations such as:

- `east`
- `west`
- Boolean operators
- Conditionals

Example production system:

```text
(n or ne) and not e -> east
(e or se) and not s -> south
(s or sw) and not w -> west
true                -> north
```

## Slide 28: Program Tree Example

The same controller can be represented as a tree of `IF`, `AND`, `OR`, and `NOT` nodes.

This tree representation enables genetic programming operations such as crossover and mutation.

## Slide 29: Fitness Function

For a given program:

1. Run the robot for 60 steps from a starting position.
2. Count how many cells next to the wall are visited.
3. Repeat for 10 randomly chosen starting positions.
4. Use the total count as the program's fitness.

Maximum fitness:

```text
32 cells per run * 10 runs = 320
```

## Slide 30: The Genetic Programming Process

Generation 0:

- 5000 random programs.

To produce generation `n + 1`:

- Copy 10% of programs from generation `n`.
- Select programs through tournament selection.
- Produce the remaining 90% using crossover.
- Optionally use mutation at a low rate.

## Slide 31: Crossover Operation

Crossover:

- Choose a subtree from a father program.
- Replace a randomly selected subtree in a mother program.
- The resulting tree is the child program.

## Slide 32: Performance of Genetic Programming

Performance depends on:

- Initial generation size
- Copy rate
- Crossover rate
- Mutation rate
- Tournament selection parameters

In the wall-following example, a perfect program can be generated after about 10 generations.

## Slide 33: Writing Action Functions by LLMs

Class discussion:

- Can an LLM write an action function for the boundary-following robot?
- What information must be provided to the LLM?
- How should the generated controller be evaluated?

## Slide 34: Sensor-Impaired Robots - Memories and States

Suppose the robot has only four sensors:

```text
s2, s4, s6, s8
```

Question:

- Can a boundary-following agent be designed using only these four sensors?

## Slide 35: Memory Features for Sensor-Impaired Robots

Define features `w1` to `w8`:

- `w2`, `w4`, `w6`, and `w8` are current sensor values.
- `w1`, `w3`, `w5`, and `w7` use previous time-step information and the last movement direction.

Using these features, a production system can still perform boundary following.

Example rules:

```text
w2 and not w4 -> east
w4 and not w6 -> south
w6 and not w8 -> west
w8 and not w2 -> north
w1            -> north
w3            -> east
w5            -> south
w7            -> west
true          -> north
```

## Slide 36: Food for Thought

Discussion questions:

- Are humans agents?
- Are LLMs agents?
