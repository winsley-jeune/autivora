#!/usr/bin/env python3
"""Recover an article JSON from a subagent transcript whose Write call was denied.

Usage: salvage-draft.py <transcript.jsonl> [...more]
Finds the LAST Write/Bash tool_use targeting content-drafts/*.json and saves its
content to that path. Validates the payload parses as JSON and has required keys.
"""
import json, re, sys

REQUIRED = {"slug", "title", "metaTitle", "metaDescription", "date", "readTime", "category", "excerpt", "content"}

def extract(path):
    candidates = []  # (file_path, content)
    with open(path, errors="ignore") as f:
        for line in f:
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue
            msg = rec.get("message", rec)
            content = msg.get("content")
            if not isinstance(content, list):
                continue
            for block in content:
                if not isinstance(block, dict) or block.get("type") != "tool_use":
                    continue
                inp = block.get("input", {})
                if block.get("name") == "Write":
                    fp = inp.get("file_path", "")
                    if "content-drafts" in fp and fp.endswith(".json"):
                        candidates.append((fp, inp.get("content", "")))
                elif block.get("name") == "Bash":
                    cmd = inp.get("command", "")
                    m = re.search(r"content-drafts/([\w-]+\.json)", cmd)
                    if m and "<<" in cmd:
                        body = re.search(r"<<\s*'?(\w+)'?\n(.*)\n\1", cmd, re.S)
                        if body:
                            candidates.append((f"/Users/jeunewinsley/Desktop/hobby/nextjs-shopify/content-drafts/{m.group(1)}", body.group(2)))
    if not candidates:
        print(f"{path}: NO draft write found")
        return False
    fp, payload = candidates[-1]
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as e:
        print(f"{path}: payload found for {fp} but invalid JSON: {e}")
        return False
    missing = REQUIRED - set(data.keys())
    if missing:
        print(f"{path}: {fp} missing keys: {missing}")
        return False
    with open(fp, "w") as out:
        json.dump(data, out, indent=2, ensure_ascii=False)
    words = sum(len(str(b).split()) for b in data["content"])
    print(f"SAVED {fp} ({words} words, {len(data['content'])} blocks)")
    return True

if __name__ == "__main__":
    ok = all([extract(p) for p in sys.argv[1:]])
    sys.exit(0 if ok else 1)
