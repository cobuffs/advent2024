import re

# Read and parse the input
with open("input.txt", "r") as file:
    entry = file.read().strip()

# Replace "don't()" with a placeholder
processing_str = entry.replace("don't()", "TURNMYCRAPOFF()")

# Extract valid `mul(x,y)` expressions
parsed = re.findall(r"mul\(\d{1,3},\d{1,3}\)", processing_str)

sum_result = 0
is_on = True

for mul_expression in parsed:
    # Find the index of the current `mul` expression
    instr_index = processing_str.find(mul_expression)

    # Get substring before the current `mul` expression
    substring = processing_str[:instr_index]

    # Find the closest "do()" or "TURNMYCRAPOFF()"
    do_index = substring.rfind("do()")
    dont_index = substring.rfind("TURNMYCRAPOFF()")

    # Determine if we need to switch "on" or "off"
    if dont_index < instr_index and dont_index > 0 and do_index < instr_index and do_index > 0:
        # If both "do" and "don't" exist, choose the one closer to the instruction
        is_on = (instr_index - do_index <= instr_index - dont_index)
    elif dont_index < instr_index and dont_index > 0:
        is_on = False
    elif do_index < instr_index and do_index > 0:
        is_on = True

    # If "on", extract numbers and calculate the product
    if is_on:
        match = re.match(r"mul\((\d+),(\d+)\)", mul_expression)
        if match:
            x, y = int(match.group(1)), int(match.group(2))
            sum_result += x * y

    # Remove the processed `mul` expression from the string
    processing_str = processing_str[:instr_index] + processing_str[instr_index + len(mul_expression):]

print(sum_result)
