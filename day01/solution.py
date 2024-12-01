# Read the input file
with open('input.txt', 'r') as file:
    entries = file.read().strip().split("\n")

list1 = []
list2 = []
diffs = []


# Parse the entries into two lists
for entry in entries:
    parsed_entry = entry.split("   ")
    list1.append(int(parsed_entry[0]))
    list2.append(int(parsed_entry[1]))

# Sort the lists
list1.sort()
list2.sort()

# Get differences with absolute values
for i in range(len(list1)):
    diffs.append(abs(list1[i] - list2[i]))

# Sum the differences
sum_diffs = sum(diffs)
print(sum_diffs)

# Part 2: Calculate counts
counts = []
for entry in list1:
    counts.append(list2.count(entry) * entry)

sum_counts = sum(counts)
print(sum_counts)