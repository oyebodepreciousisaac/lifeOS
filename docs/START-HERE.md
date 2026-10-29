# Start Here — Oyebode Product Project Template

This template is for one real product/solution project. It is not the personal website workspace.

## 1. Start with the problem

Use `oyebode-builder` and begin with the real observation, workflow, affected user, and current workaround. Do not start by asking the agent to generate the UI or write the whole app.

Example:

> Use oyebode-builder. I noticed this problem: [describe the real problem]. Help me investigate whether it is worth solving. Do not code yet.

## 2. Let the builder establish the evidence

The builder should move through problem framing, PRECIOUS, research, user discovery, workflow mapping, value hypothesis, alternatives, risks, and a build gate. It should stop or return to discovery when critical assumptions are still unsupported.

## 3. Create the product identity when the solution is sufficiently defined

Use `oyebode-product-brand-studio` when the product needs a name, positioning, visual language, UX/UI direction, reference-site analysis, or a complete product design system.

Example:

> Use oyebode-product-brand-studio. Based on the validated product context in docs/, create an original product brand and design system. Study these reference products: [URLs]. Do not clone them. Extract useful principles and adapt them to this product.

The resulting `docs/` artifacts become the source of truth for product UI implementation.

## 4. Return to the builder for implementation

Use `oyebode-builder` again with the approved product design artifacts. Build in vertical slices, verify edge cases and permissions, test critical flows, and keep the scope tied to the value hypothesis.

Example:

> Use oyebode-builder. Read the approved docs/ product and design artifacts. Build the smallest vertical slice for [workflow]. Do not expand scope beyond the defined MVP without evidence.

## 5. Keep the project evidence current

Use `docs/` for decision-supporting artifacts such as:

- idea-brief.md
- problem-research.md
- precious-analysis.md
- user-discovery.md
- alternatives.md
- product-strategy.md
- mvp-spec.md
- ux-flows.md
- architecture.md
- data-model.md
- ai-spec.md
- analytics.md
- test-plan.md
- launch-plan.md
- decision-log.md
- learning-log.md
- case-study.md

Create only the artifacts that help the project. Do not create empty paperwork.

## 6. Skill Creator is separate infrastructure

Do not modify `skill-creator/` during product work. Use it only when the task is specifically about creating, testing, benchmarking, improving, or packaging a skill.

## Core loop

**Problem → Research → PRECIOUS → User Discovery → Workflow → Value Hypothesis → Solution → MVP → Product Brand → UX → Architecture → Engineering → AI/Automation where justified → Test → Launch → Measure → Learn → Iterate → Document → Business Value**
