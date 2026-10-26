# Oyebode Antigravity Product Project Template

This template is a reusable workspace for building one real product from problem to production.

## Core skills

### `oyebode-builder`
The default product-building operating system:

**Problem → Research → PRECIOUS → User Discovery → Workflow → Value Hypothesis → Solution → MVP → UX → Product Brand when needed → Architecture → Engineering → AI/Automation where justified → Test → Launch → Measure → Learn → Iterate → Document → Business Value**

### `oyebode-product-brand-studio`
The product-specific brand and design system layer:

**Product context → Reference research → Extraction → Pattern synthesis → Product brand → Design system → UX → Anti-generic-AI review → Implementation handoff**

### `skill-creator`
Infrastructure for creating, evaluating, improving, benchmarking, and packaging skills. It is kept separate from normal product work and must not be modified during ordinary projects.

## Canonical locations

```text
.agents/
└── skills/
    ├── oyebode-builder/
    │   ├── SKILL.md
    │   ├── BUILDER.md
    │   ├── BUILDER_README.md
    │   ├── references/
    │   ├── evals/
    │   └── scripts/
    └── oyebode-product-brand-studio/
        ├── SKILL.md
        ├── references/
        ├── evals/
        └── scripts/
```

## Recommended project flow

1. Start with the actual problem using `oyebode-builder`.
2. Run discovery and the PRECIOUS build gate.
3. Define the smallest value-producing MVP.
4. Use `oyebode-product-brand-studio` when the product needs its own identity or design system.
5. Return to `oyebode-builder` for architecture and vertical-slice implementation.
6. Test, launch, measure, learn, and iterate.

See `START-HERE.md` for ready-to-use prompts.
