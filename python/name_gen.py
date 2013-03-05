import random

def notClear(w):
	return w!=''

def convertName(n):
	n = n[:2]
	n[0] = n[0].capitalize()
	n[1] = float(n[1])
	return n

# pull names randomly and without repetition from a file based on probability of name occurring
class NameGen(object):
	def __init__(self):
		self.names = [convertName(filter(notClear, name.split(' '))) for name in filter(notClear, open('female_names.txt','r').read().split('\n'))]
		self.total = sum(map(lambda x:x[1], self.names))
	def pullName(self):
		if len(self.names) == 0:
			raise Exception("no more names")
		r = random.uniform(0, self.total)
		for name in self.names:
			r -= name[1]
			if r < 0:
				self.names.remove(name)
				self.total -= name[1]
				return name[0]
		return self.names[-1][0]