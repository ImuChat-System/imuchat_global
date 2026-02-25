#!/usr/bin/env python3
"""Fix Hub pages — remove leftover setHeader/clearHeader useEffect blocks."""

import re
import os
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MINI_APPS = [
    'imu-worlds', 'imu-contests', 'imu-sports', 'imu-finance',
    'imu-services', 'imu-formations', 'imu-dating', 'imu-mobility',
    'imu-library', 'imu-smart-home', 'imu-style-beauty',
]

def fix_hub_page(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # 1. Remove useEffect blocks containing setHeader/clearHeader
    # Match: useEffect(() => { ...setHeader... return () => clearHeader(); }, [...]);
    content = re.sub(
        r'\n\s*useEffect\(\(\)\s*=>\s*\{.*?setHeader.*?return\s*\(\)\s*=>\s*clear(?:Header|Footer)\(\);?\s*\}.*?\]\);?\s*',
        '\n', content, flags=re.DOTALL
    )
    
    # Also simpler patterns without return
    content = re.sub(
        r'\n\s*useEffect\(\(\)\s*=>\s*\{[^}]*setHeader[^}]*\},\s*\[[^\]]*\]\);?\s*',
        '\n', content, flags=re.DOTALL
    )
    
    # 2. Remove orphaned pathname lines
    content = re.sub(r'\n\s*const\s+\{\s*pathname\s*\}\s*=\s*useNavigation\(\);?\s*\n', '\n', content)
    
    # 3. Remove useNavigation import if no longer used
    if 'useNavigation()' not in content and 'useNavigation(' not in content:
        content = re.sub(r"import\s+\{\s*useNavigation\s*\}\s+from\s+'@/hooks/use-navigation';\s*\n?", '', content)
    
    # 4. Remove useEffect from React imports if no longer used
    if 'useEffect(' not in content:
        # Remove useEffect from destructured imports
        content = re.sub(r'(\bimport\s*\{[^}]*)\buseEffect\b,?\s*', r'\1', content)
        # Clean up trailing commas in imports
        content = re.sub(r',\s*\}', ' }', content)
        content = re.sub(r'\{\s*,', '{ ', content)
    
    # 5. Clean multiple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    fixed = 0
    for app in MINI_APPS:
        pages_dir = os.path.join(ROOT, app, 'src', 'pages')
        if not os.path.isdir(pages_dir):
            continue
        for f in glob.glob(os.path.join(pages_dir, '*.tsx')):
            if fix_hub_page(f):
                print(f"  ✅ Fixed: {os.path.relpath(f, ROOT)}")
                fixed += 1
            else:
                print(f"  ⏭  No changes: {os.path.relpath(f, ROOT)}")
    
    print(f"\n  {fixed} files fixed.")

if __name__ == '__main__':
    main()
