import os
import zipfile
import time

workspace_dir = os.path.abspath(os.path.dirname(__file__) + '/..')
desktop_dir = os.path.expanduser('~/Desktop')
dest_desktop = os.path.join(desktop_dir, 'futurememory-cart.zip')
dest_local = os.path.join(workspace_dir, 'futurememory-cart.zip')

print(f"Workspace: {workspace_dir}")
print(f"Destination: {dest_desktop}")

# Folders & files to exclude
EXCLUDE_DIRS = {
    'node_modules',
    '.git',
    '.wwebjs_auth',
    '.wwebjs_cache',
    'dist',
    '.next'
}

# Timestamp for zip entries: now
now_time = (2026, 10, 9, 12, 0, 0)

def make_zip(out_path):
    with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for root, dirs, files in os.walk(workspace_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            
            for file in files:
                # Do not zip the zip file itself!
                if file.endswith('.zip'):
                    continue
                    
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, workspace_dir)
                
                # Check rel_path doesn't start with excluded
                parts = rel_path.split(os.sep)
                if any(p in EXCLUDE_DIRS for p in parts):
                    continue
                    
                try:
                    with open(full_path, 'rb') as fp:
                        data = fp.read()
                    zinfo = zipfile.ZipInfo(rel_path.replace(os.sep, '/'), now_time)
                    zipf.writestr(zinfo, data)
                except Exception as e:
                    print(f"Skipping {rel_path}: {e}")

# Create on Desktop
make_zip(dest_desktop)
size_mb = os.path.getsize(dest_desktop) / (1024 * 1024)
print(f"Desktop Zip created: {dest_desktop} ({size_mb:.2f} MB)")

# Create in workspace root as well
make_zip(dest_local)
print(f"Workspace Zip created: {dest_local}")
