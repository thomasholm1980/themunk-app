f = open('apps/web/lib/interpreter-prompt.ts', 'r')
content = f.read()
f.close()

content = content.replace(
    '"guidance: Try to keep your pace a little steadier today.",',
    '"guidance: Try to keep your pace a little steadier today.",\n    "BAD guidance example: A steady pace may feel more comfortable today.",\n    "BAD insight example: Your sleep quality may be affecting your stress levels.",\n    "GOOD insight example: Your stress often rises after shorter sleep.",'
)

f = open('apps/web/lib/interpreter-prompt.ts', 'w')
f.write(content)
f.close()
print('written ok')
