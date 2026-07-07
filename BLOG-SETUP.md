# ClearPath Blog — auto-publishing setup

The site now has a `/blog` section that **publishes one new post every morning**,
fully automatically, written by Claude and committed to the repo.

## How it works
1. A GitHub Action (`.github/workflows/daily-blog.yml`) runs daily at **8:00 AM Phoenix**.
2. It runs `scripts/generate-blog-post.mjs`, which:
   - Picks the day's topic (Dean's weekday rotation).
   - Asks Claude (`claude-opus-4-8`) to write an on-brand, SEO+GEO-optimized post
     with hard "no medical advice" guardrails and a disclaimer on every article.
   - Renders a standalone, brand-styled page at `/blog/<slug>/`.
   - Updates `blog/posts.json`, rebuilds `blog/index.html`, and rebuilds `sitemap.xml`.
3. The Action commits the new files; **Netlify auto-deploys** them.

Cost: ~$0.05 per post (~$18/year) on `claude-opus-4-8`.

## One-time setup (required for auto-posting)
Auto-posting needs the site in a **Git repo connected to Netlify** (the current
drag-and-drop deploy can't self-update).

1. **Put this folder in a GitHub repo** (e.g. `clearpath-site`) and push it.
2. **Connect the repo to your existing Netlify site:**
   Netlify → your site → *Site configuration → Build & deploy → Link repository*.
   - Build command: *(leave empty)*
   - Publish directory: `.`
3. **Create an Anthropic API key:** console.anthropic.com → API Keys → Create Key.
4. **Add it as a GitHub secret:** repo → *Settings → Secrets and variables → Actions →
   New repository secret* → name it **`ANTHROPIC_API_KEY`**, paste the key.
5. **Test it now:** repo → *Actions → "Daily blog post" → Run workflow*.
   A new post should appear in `/blog/` within a minute or two, and Netlify redeploys.

## Handy commands
```bash
# Preview the styling with a canned post — no API key, no cost:
CLEARPATH_BLOG_DRYRUN=1 node scripts/generate-blog-post.mjs

# Generate a real post locally (needs ANTHROPIC_API_KEY in your env):
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run generate:blog

# Use a cheaper model (optional): set CLEARPATH_BLOG_MODEL, e.g. claude-sonnet-5
```

## Notes / knobs
- **Topic rotation** lives in `TOPIC_BY_DAY` in `scripts/generate-blog-post.mjs`.
- **Guardrails / voice / length** live in the system prompt in the same file
  (`buildSystemPrompt`). Edit there to tune style.
- **The seed article** (`/blog/organize-pediatric-specialist-appointments/`) was
  created in dry-run so the blog isn't empty at launch. Keep it or delete the
  folder + its entry in `blog/posts.json`, then run the dry-run once to rebuild
  the index/sitemap.
- **Fully automatic, no review** — per request. Because it's a health-adjacent
  brand, the prompt enforces education-only content and a disclaimer on every
  post. If you ever want a human approval step, it's a small change to the Action.
