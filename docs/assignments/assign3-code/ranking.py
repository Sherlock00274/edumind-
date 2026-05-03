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
