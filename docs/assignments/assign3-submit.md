# CSIT5900 Assignment 3

## **Problem 1**

### **Propositional Symbols**

$$
\begin{aligned}
M &: \text{unicorn is mythical} \\
I &: \text{unicorn is immortal} \\
T &: \text{unicorn is mortal} \\
A &: \text{unicorn is a mammal} \\
H &: \text{unicorn is horned} \\
G &: \text{unicorn is magical}
\end{aligned}
$$



### **Knowledge Base (KB)**

$$
\begin{aligned}
(1) & M \rightarrow I \\
(2) & \neg M \rightarrow (T \land A) \\
(3)& (I \lor A) \rightarrow H \\
(4)& H \rightarrow G
\end{aligned}
$$



### **CNF Form**

$$
\begin{aligned}
(1)& \neg M \lor I \\
(2)& M \lor T \\
(3)& M \lor A \\
(4)& \neg I \lor H \\
(5)& \neg A \lor H \\
(6)& \neg H \lor G
\end{aligned}
$$




### **(a) Is the unicorn mythical?**

**Answer:** No.

**Countermodel:**
$$
M = F,\quad I = F,\quad T = T,\quad A = T,\quad H = T,\quad G = T
$$
This assignment satisfies all clauses in the KB while making $M = F$. Therefore:
$$
KB \not\models M
$$

### **(b) Is the unicorn horned?**

**Answer:** Yes.

**Proof by refutation:** Assume $\neg H$.
$$
\begin{aligned}
(7)& \neg H \quad (\text{assumption}) \\
(4),(7)& \Rightarrow \neg I \\
(1),\neg I& \Rightarrow \neg M \\
(5),(7)& \Rightarrow \neg A \\
(3),\neg A& \Rightarrow M \\
M,\neg M &\Rightarrow \Box
\end{aligned}
$$

$$
\therefore\ KB \models H
$$

### **(c) Is the unicorn magical?**

**Answer:** Yes.

**Proof by refutation:** Assume $\neg G$.
$$
\begin{aligned}
(7)& \neg G \quad (\text{assumption}) \\
(6),(7)& \Rightarrow \neg H \\
(4),\neg H& \Rightarrow \neg I \\
(1),\neg I & \Rightarrow \neg M \\
(5),\neg H& \Rightarrow \neg A \\
(3),\neg A& \Rightarrow M \\
M,\neg M &\Rightarrow \Box
\end{aligned}
$$

$$
\therefore\ KB \models G
$$


## **Problem 2**

### **Vocabulary**

$$
\text{Student(x), Person(x), Vegetarian(x), Smart(x)}
$$

$$
\text{Takes(x,c), Failed(x,c), Dislikes(x,y), DoesHomeworkFor(x,y)}
$$

Constants: $History,\ Biology,\ Ted$



### **(a)**

$$
\neg \forall x \left( Student(x) \rightarrow (Takes(x,History) \land Takes(x,Biology)) \right)
$$

Equivalent form:
$$
\exists x \left( Student(x) \land \neg (Takes(x,History) \land Takes(x,Biology)) \right)
$$


### **(b)**

$$
\exists x \Big( Student(x) \land Failed(x,History) \land \forall y \big((Student(y)\land Failed(y,History)) \rightarrow y=x \big) \Big)
$$



### **(c)**

$$
\forall x \Big( (Person(x) \land \forall y (Vegetarian(y) \rightarrow Dislikes(x,y))) \rightarrow \neg Smart(x) \Big)
$$



### **(d)**

$$
\forall x \Big( (Person(x) \land \forall y (Vegetarian(y) \rightarrow Dislikes(x,y))) \rightarrow Dislikes(Ted,x) \Big)
$$



### **(e)**

$$
\exists x \Big( Student(x) \land \forall y (DoesHomeworkFor(x,y) \leftrightarrow \neg DoesHomeworkFor(y,y)) \Big)
$$



## **Problem 3 (GSCA Learning)**

### **Positive Examples**

$$
\{1,3,4,5\}
$$



### **Iteration 1**

EXP has the highest positive-to-total coverage ratio $3/4$, the largest among single features.
With EXP fixed, $EXP ∧ GPA$ covers examples 1,3,5 and no negative examples.

Initial hypothesis:
$$
\tau = \text{true} \rightarrow Hire
$$
Refinement:
$$
EXP \land GPA \rightarrow Hire
$$
Covers examples $1,3,5$ and no negative examples.



### **Iteration 2**

After removing 1,3,5, only positive example 4 remains.
UST has the best single-feature ratio among remaining examples.
$UST ∧ REC$ covers example 4 and no negative examples.

Remaining positive example:
$$
\{4\}
$$
Refinement:
$$
UST \land REC \rightarrow Hire
$$


### **Final Hypothesis**

$$
\begin{aligned}
(1)& EXP \land GPA \rightarrow Hire \\
(2)& UST \land REC \rightarrow Hire
\end{aligned}
$$

## **Problem 4**

### **Payoff Matrix**

|              | Fed contract | Fed do nothing | Fed expand |
| ------------ | ------------ | -------------- | ---------- |
| Pol contract | (1,7)        | (4,9)          | (6,6)      |
| Pol idle     | (2,8)        | (5,5)          | (9,4)      |
| Pol expand   | (3,3)        | (7,2)          | (8,1)      |



### **Nash Equilibrium**

For Fed contract, Pol's best response is expand.
For Pol expand, Fed's best response is contract.
Thus $(Pol expand, Fed contract)$ is a Nash equilibrium.
No other cell is mutual best response.
$$
(Pol\ expand,\ Fed\ contract)
$$
Payoff:
$$
(3,3)
$$


## **Problem 5**

Players: $N = \{1,2\}$

Actions: $A_1 = A_2 = \{1,2,3,4,5,6\}$

Utility Function:
$$
u_i(b_i,b_j)=
\begin{cases}
6-b_i & b_i>b_j \\
\frac{6-b_i}{2} & b_i=b_j \\
0 & b_i<b_j
\end{cases}
$$
Pure Nash Equilibria:

For (4,4), each player gets 1. Deviating to 5 also gives 1, and all other deviations give at most 1.
For (5,5), each player gets 1/2. Deviating to 6 gives 0, and lower bids lose.
For (6,6), each player gets 0. Any lower bid loses and gives 0.
Therefore no player can improve by unilateral deviation.
$$
(4,4),\ (5,5),\ (6,6)
$$

## **Problem 6**

$$
\begin{aligned}
I &= \min(0,7)=0 \\
F &= \max(0,5)=5 \\
G &= \max(7,8)=8 \\
B &= \min(3,5)=3 \\
C &= \min(5,8,4)=4 \\
A &= \max(3,4)=4
\end{aligned}
$$



### **Root Value**

$$
A = 4
$$



## **Problem 7**

### **Left-to-right**

Visited:
$$
D, E, M, J, K, H
$$
Pruned:
$$
N, L
$$


### **Right-to-left**

Visited:
$$
H, L, J, E, D
$$
Pruned:
$$
K, N, M
$$

$$
A = 4
$$




## **Problem 8**

$$
L_1, L_2, L_3
$$

$$
\begin{aligned}
T_1 &= \neg L_1 \\
T_2 &= \neg L_2 \\
T_3 &= \neg L_3
\end{aligned}
$$

$$
S_1=T_1,\quad S_2=L_2,\quad S_3=T_2
$$



### **Final Assignment**

$$
L_1=T,\quad L_2=F,\quad L_3=F
$$

$$
\text{Room I}
$$

```python
from z3 import And, Bool, Not, Or, Solver


L1 = Bool("L1")
L2 = Bool("L2")
L3 = Bool("L3")
T1 = Bool("T1")
T2 = Bool("T2")
T3 = Bool("T3")

s = Solver()

# Each room contains either a lady or a tiger, but not both.
s.add(T1 == Not(L1))
s.add(T2 == Not(L2))
s.add(T3 == Not(L3))

# Exactly one lady.
s.add(Or(L1, L2, L3))
s.add(Not(And(L1, L2)))
s.add(Not(And(L1, L3)))
s.add(Not(And(L2, L3)))

# Signs.
S1 = T1
S2 = L2
S3 = T2

# At most one sign is true.
s.add(Not(And(S1, S2)))
s.add(Not(And(S1, S3)))
s.add(Not(And(S2, S3)))

# Prove that the lady is in Room I by refutation.
s.add(Not(L1))

print(s.check())
```

## **Problem 9**

$$
\begin{aligned}
1.& Mary \\
2.& Bob \\
3.& Jim \\
4.& Lisa
\end{aligned}
$$

$$
\text{Lisa is the biology major}
$$

```python
from z3 import Abs, And, Bool, Distinct, Implies, Int, Not, Or, Solver


people = ["Lisa", "Bob", "Jim", "Mary"]
rank = {person: Int(person) for person in people}

s = Solver()

for person in people:
    s.add(rank[person] >= 1)
    s.add(rank[person] <= 4)

s.add(Distinct([rank[person] for person in people]))

# Lisa is not next to Bob in the ranking.
s.add(Abs(rank["Lisa"] - rank["Bob"]) != 1)

# Bob is ranked immediately ahead of Jim.
s.add(rank["Bob"] + 1 == rank["Jim"])

# One of the women is ranked first.
s.add(Or(rank["Lisa"] == 1, rank["Mary"] == 1))

# One of the women is a biology major, and Jim is immediately ahead of
# the biology major.
LisaBio = Bool("LisaBio")
MaryBio = Bool("MaryBio")
s.add(Or(LisaBio, MaryBio))
s.add(Not(And(LisaBio, MaryBio)))
s.add(Implies(LisaBio, rank["Jim"] + 1 == rank["Lisa"]))
s.add(Implies(MaryBio, rank["Jim"] + 1 == rank["Mary"]))

print(s.check())
print(s.model())

```

![1777822294782](image/assign3-submit/1777822294782.png)![1777822297237](image/assign3-submit/1777822297237.png)