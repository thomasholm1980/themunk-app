# Future Architecture: Closed-Loop Regulation System

**Status:** Direction note only. Not an implementation task.  
**Author:** Manju (Chief AI Architect)  
**Date:** 2026-03-07

---

## Current System

The Munk currently operates as an **interpretation system**:
```
signals → state → interpretation → language → governance → core screen
```

The system observes, interprets, and surfaces a daily reading.  
It does not yet close the loop between recommendation and response.

---

## Future Direction

The Munk will evolve toward a **closed-loop regulation system**:
```
signals
→ state engine
→ interpretation
→ intervention engine      ← future
→ ritual layer             ← future
→ response capture         ← future
→ intervention memory      ← future
→ adaptive selection       ← future
→ core screen
```

---

## Future Layers

### Intervention Engine
Selects specific, timed interventions based on current state and protocol.  
Deterministic. Rule-based. Not generative.

### Ritual Layer
Structures interventions into daily rituals with timing anchors.  
Connects to wake_time and protocol schedule.

### Response Capture
Records whether the user acted on an intervention.  
Binary or simple scale. No journaling.

### Intervention Memory
Stores intervention history per user.  
Enables pattern detection across intervention outcomes.

### Adaptive Selection
Adjusts intervention selection based on historical response patterns.  
Still deterministic — rule-based adaptation, not ML.

---

## Architectural Principles (unchanged)

- Core logic remains deterministic
- No LLM in regulation loop
- Language layer remains separate from logic layer
- Governance layer protects output discipline
- System Speaks Once

---

## Current Focus
```
Core Screen polish
Visual hierarchy
Calm UX
```

This document does not trigger implementation work.  
It defines direction for future briefs when the current foundation is stable.
