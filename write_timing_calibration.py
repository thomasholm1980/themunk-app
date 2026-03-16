import re

path = '/Users/thomas/Desktop/The_Munk_Health/themunk_app/apps/web/app/components/MunkDailyBriefRatnaV2.tsx'

with open(path, 'r') as f:
    content = f.read()

old = """const TIMINGS = {
  breathStartMs: 1200,
  insightMs:     2400,
  guidanceMs:    3300,
  reflectionMs:  4200,
};"""

new = """const TIMINGS = {
  breathStartMs: 1400,
  insightMs:     3200,
  guidanceMs:    4800,
  reflectionMs:  6400,
};"""

if old in content:
    content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)
    print("Timing calibrated successfully")
else:
    print("ERROR: TIMINGS block not found — check file")
