const mongoose = require('mongoose');
require('dotenv').config();

const BlogPost = require('../models/BlogPost');

const posts = [
  {
    title: 'Cutting Claude Token Usage by 70% with a Two-Model Workflow',
    slug: 'claude-gemini-token-optimization',
    excerpt: 'Running a complex ASO audit in Claude burned 40% of my usage quota in a single session. Here\'s how I cut that to 12% by routing document analysis to Gemini CLI and keeping Claude focused on reasoning and file edits.',
    tags: ['AI', 'Claude Code', 'Gemini CLI', 'Workflow', 'Optimization'],
    publishedAt: new Date('2026-03-28'),
    content: `# Cutting Claude Token Usage by 70% with a Two-Model Workflow

## The Problem

I use Claude Code heavily for building and maintaining Android apps — writing code, reviewing plans, running structured audits. One of my recurring tasks is auditing ASO (App Store Optimization) plans: checking keyword tiers, character counts, metadata completeness, cross-referencing a keyword research doc against a planning doc against a style guide.

The first time I ran this workflow, I used **~40% of my Claude usage allowance in a single session**. That was on Opus. Even on Sonnet it was expensive — the task involves reading multiple large documents, running multi-pass audits with iterative fixes, and producing a structured report. All of that context compounds fast.

I needed a way to do the heavy document analysis without burning through my Claude quota.

---

## The Insight

Claude Code can run shell commands. Gemini has a CLI. You can pipe text into it.

That's the whole idea. Instead of asking Claude to read four documents and audit them, I have Claude build a prompt and hand it off to Gemini. Gemini does the analysis. Claude reads the results and takes action.

The two models have different strengths:
- **Gemini** is good at bulk document analysis, checklist evaluation, and structured output — and its CLI is cheap.
- **Claude** is good at reasoning about what to do with findings, making judgment calls, editing files, and managing multi-step workflows.

So I split the work: Gemini audits, Claude fixes.

---

## How It Works

The workflow is a Claude Code skill (a custom slash command) called \`/review-aso-plan\`. When invoked:

1. Claude reads the ASO plan, keyword research doc, and ASO guide
2. Claude builds a single temp file at \`/tmp/aso-audit-input.txt\` containing:
   - The full audit checklist (rules, output format, severity definitions)
   - All three documents under labeled section headers
3. Claude runs:
   \`\`\`bash
   cat /tmp/aso-audit-input.txt | ~/.npm-global/bin/gemini > /tmp/gemini-pass-1.txt 2>&1
   \`\`\`
4. Claude reads the output, lists every issue, and fixes them all
5. Claude rebuilds the input with updated file contents and runs another pass
6. This repeats up to 5 times until Gemini finds no new issues
7. Claude writes a structured run log and final report

Gemini never touches the filesystem. It just receives a prompt via stdin and returns a structured issue list. Claude handles everything else.

---

## The Numbers

| | Model | Claude Usage | Gemini Usage |
|---|---|---|---|
| Before | Opus | ~40% | — |
| After | Sonnet | ~12% | ~2% |

That's roughly a **70% reduction in Claude token usage** for the same task. The Gemini cost is negligible.

The savings come from a few places:
- The document analysis (the most token-heavy part) moves entirely to Gemini
- Running on Sonnet instead of Opus is now viable because Claude's role is narrower — file editing and workflow management, not heavy analysis
- Gemini's output is compact and structured, so Claude doesn't need to re-read large documents to understand the findings

---

## The Tradeoff

Gemini's analysis isn't perfect. It misses things on the first pass, which is why the workflow runs up to 5 iterations. Each pass catches issues the previous one missed. The iterative structure compensates for single-pass imprecision.

Claude also stays in the loop as the decision-maker. If Gemini flags something ambiguous, Claude makes the call. If a fix introduces a new issue, the next pass catches it. The two models check each other's work.

---

## Generalizing the Pattern

This pattern works for any task where the expensive part is reading and analyzing documents:

- **Code review** — pipe the diff and style guide to Gemini, have Claude fix what's flagged
- **Content review** — documentation, marketing copy, legal checklists
- **Data extraction** — parse a large file, extract structured fields, Claude processes the output
- **Multi-document cross-referencing** — exactly what the ASO workflow does

The key constraint is that Gemini needs to produce structured, actionable output. If its output is too vague or inconsistent, Claude spends tokens interpreting it. The audit checklist solves this by specifying the exact output format: Critical/Major/Minor, one line per issue, pipe-delimited fields.

---

## What I'm Thinking About Next

The manual part of this setup is writing the skill and the checklist. For the ASO workflow, that was worth it — it's a recurring task with a well-defined rubric. But for ad-hoc tasks, you'd want something more dynamic.

I'm considering a tool that automatically routes Claude tasks to Gemini for the analysis phase based on token budget or task type. Something like: if a task involves reading more than N tokens of documents, hand off the analysis to Gemini and bring back a structured summary. Claude stays in control of the workflow; Gemini becomes a cheap analysis backend.

Not sure if it's worth building yet. The manual approach is already working well. But the pattern is clearly reusable, and there's probably a cleaner abstraction waiting to be found.

---

## Summary

- Heavy document analysis is expensive in Claude; Gemini CLI handles it cheaply
- The trick is giving Gemini a structured output format so Claude can act on the results without interpretation overhead
- Iterative passes (up to 5) compensate for single-pass imprecision
- This brought a 40%-of-quota task down to 12%, running on Sonnet instead of Opus
- The pattern generalizes to any workflow where reading >> reasoning`
  }
];

const seedBlog = async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const post of posts) {
      await BlogPost.findOneAndUpdate(
        { slug: post.slug },
        post,
        { upsert: true, new: true }
      );
      console.log(`✅ Upserted: ${post.title}`);
    }

    console.log('🎉 Blog seed complete');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedBlog();
