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
