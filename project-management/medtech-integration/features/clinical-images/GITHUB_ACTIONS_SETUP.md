# GitHub Actions Setup for Lightsail BFF Auto-Deployment

**Time Required:** 10 minutes (one-time setup)  
**Result:** Push to main → Auto-deploys to Lightsail BFF  
**Status:** ✅ COMPLETE (as of 2026-01-02)

---

## What This Does

After setup, every time you push code that affects the BFF (`lightsail-bff/**` folder):
1. GitHub Actions detects the change
2. SSHs into your Lightsail server
3. Runs: `git pull → rsync BFF files → npm ci → systemctl restart`
4. Verifies deployment succeeded
5. Comments on the commit with status

**No more manual SSH deployments!** 🎉

**Repository Structure:**
- BFF source code is in `/lightsail-bff/` folder of main `ClinicProNZ` repo
- Deployed to `/home/deployer/app/` on Lightsail server
- Workflow file: `.github/workflows/deploy-lightsail-bff.yml`

---

## One-Time Setup

### Step 1: Get Your SSH Private Key

You mentioned you have the SSH key. Find the private key file you use to SSH into Lightsail.

**Common locations:**
- `~/.ssh/lightsail-key.pem`
- `~/.ssh/id_rsa`
- `~/Downloads/clinicpro-lightsail.pem`

**Test it works:**
```bash
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12
```

If that connects successfully, you have the right key!

---

### Step 2: Copy the Private Key Content

```bash
# On Mac/Linux:
cat /path/to/your-key.pem

# Copy the ENTIRE output, including:
# -----BEGIN RSA PRIVATE KEY-----
# (all the random characters)
# -----END RSA PRIVATE KEY-----
```

**Important:** Copy the ENTIRE key, including the `BEGIN` and `END` lines.

---

### Step 3: Add SSH Key to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/YOUR_REPO`

2. Click **Settings** (top right)

3. In left sidebar, click **Secrets and variables** → **Actions**

4. Click **New repository secret** (green button)

5. Add secret:
   - **Name:** `LIGHTSAIL_SSH_KEY`
   - **Value:** Paste the entire SSH private key (from Step 2)
   - Click **Add secret**

✅ **Secret added!**

---

### Step 4: Verify Lightsail Git Configuration

The workflow pulls from the main `ClinicProNZ` repository.

**Check git setup:**

```bash
# SSH into Lightsail
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# Switch to deployer user
sudo -u deployer bash

# Navigate to app directory
cd ~/app

# Check current remote
git remote -v

# Should show:
# origin  https://github.com/reonzpika/ClinicProNZ.git (fetch)
# origin  https://github.com/reonzpika/ClinicProNZ.git (push)
```

**If remote points to old `clinicpro-bff` repo:**

```bash
# Update remote to main repo
git remote set-url origin https://github.com/reonzpika/ClinicProNZ.git

# Verify
git remote -v

# Pull from main repo
git pull origin main
```

---

### Step 5: Test the Workflow

The GitHub Actions workflow is already created in `.github/workflows/deploy-lightsail-bff.yml`.

**To test:**

1. Make a small change to any BFF-related file (e.g., add a comment in `src/lib/services/medtech/alex-api-client.ts`)

2. Commit and push:
   ```bash
   git add .
   git commit -m "test: trigger BFF deployment"
   git push origin main
   ```

3. Go to GitHub → **Actions** tab

4. You should see "Deploy to Lightsail BFF" workflow running

5. Click on it to see live logs

6. After ~1-2 minutes, should see ✅ **Deployment successful!**

---

## How It Works

### Triggers (When Does It Deploy?)

The workflow ONLY runs when you push changes to `main` branch AND modify these paths:

```yaml
paths:
  - 'lightsail-bff/**'                                 # BFF source code
  - '.github/workflows/deploy-lightsail-bff.yml'       # Workflow itself
```

**This means:**
- ✅ Change any file in `lightsail-bff/` → BFF deploys
- ✅ Change workflow file → BFF deploys
- ❌ Change Vercel API routes → BFF does NOT deploy (no need)
- ❌ Change frontend components → BFF does NOT deploy (no need)

**Smart, right?** Only deploys when BFF code actually changes.

---

### What Happens During Deployment

```bash
# 1. Navigate to app directory
cd /home/deployer/app

# 2. Pull latest code from main GitHub repo
sudo -u deployer git pull origin main

# 3. Copy BFF files from lightsail-bff folder to app root
sudo -u deployer rsync -av --exclude='.env' --exclude='node_modules' lightsail-bff/ .

# 4. Install production dependencies (clean install)
cd /home/deployer/app
sudo -u deployer npm ci --production

# 5. Restart BFF service
sudo systemctl restart clinicpro-bff

# 6. Wait 3 seconds for service to start
sleep 3

# 7. Check service is running
sudo systemctl is-active clinicpro-bff

# 8. Show status
sudo systemctl status clinicpro-bff
```

**Total time:** ~1-2 minutes

---

## Troubleshooting

### Error: "Permission denied (publickey)"

**Problem:** SSH key not working

**Solution:**
1. Verify you copied the ENTIRE key (including BEGIN/END lines)
2. Check there are no extra spaces or line breaks
3. Try re-adding the secret in GitHub

---

### Error: "git pull failed"

**Problem:** Git not set up on Lightsail

**Solution:** Follow Step 4 above to initialize git

---

### Error: "npm ci failed"

**Problem:** Missing `package-lock.json` or npm issue

**Solution:**
```bash
# SSH into Lightsail
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

cd /opt/clinicpro-bff

# Generate package-lock.json
npm install

# Commit it
git add package-lock.json
git commit -m "chore: add package-lock.json"
git push origin main
```

---

### Error: "sudo systemctl restart failed"

**Problem:** Ubuntu user doesn't have sudo permissions

**Solution:**
```bash
# SSH into Lightsail
ssh -i /path/to/your-key.pem ubuntu@13.236.58.12

# Grant ubuntu user sudo permissions for systemctl restart
sudo visudo

# Add this line at the end:
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl restart clinicpro-bff
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl is-active clinicpro-bff
ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl status clinicpro-bff

# Save and exit (Ctrl+X, Y, Enter)
```

---

### Workflow Doesn't Trigger

**Problem:** Pushed code but workflow didn't run

**Check:**
1. Did you push to `main` branch?
2. Did you change files in the watched paths?
3. Check GitHub → Actions → "All workflows" (might be filtered)

**Manual trigger** (if needed):
1. Go to GitHub → Actions
2. Click "Deploy to Lightsail BFF"
3. Click "Run workflow" → "Run workflow"

---

## Benefits vs Manual Deployment

| Aspect | Manual SSH | GitHub Actions |
|--------|-----------|----------------|
| **Time** | 2-3 minutes | 1-2 minutes (automatic) |
| **Consistency** | ❌ Error-prone (forget steps) | ✅ Same every time |
| **Visibility** | ❌ No logs | ✅ Full logs in GitHub |
| **Rollback** | ❌ Manual git revert | ✅ Redeploy previous commit |
| **Remote Work** | ❌ Need SSH access | ✅ Push from anywhere |
| **Team** | ❌ Everyone needs SSH key | ✅ Works for all contributors |

---

## Customization

### Change Deployment Branch

Edit `.github/workflows/deploy-lightsail-bff.yml`:

```yaml
on:
  push:
    branches:
      - main          # Change this
      - production    # Or add multiple branches
```

---

### Add Deployment Notifications

Want Slack/Discord notifications? Add after the deploy step:

```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "✅ BFF deployed to Lightsail successfully!"
      }
```

---

### Deploy Multiple Servers

If you scale to multiple Lightsail instances:

```yaml
- name: Deploy to Server 1
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: 13.236.58.12
    # ... same as before

- name: Deploy to Server 2
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: 13.236.58.13  # Different IP
    # ... same as before
```

---

## Security Notes

- ✅ SSH key stored in GitHub Secrets (encrypted)
- ✅ Only runs on push to main (protected branch recommended)
- ✅ Full audit trail in Actions logs
- ✅ Can require approval before deploy (GitHub Environments)

**Recommended:** Enable branch protection on `main`:
1. GitHub → Settings → Branches
2. Add rule for `main`
3. Require pull request reviews before merging

---

## Next Steps

After setup is complete:
1. ✅ Test deployment by pushing a small change
2. ✅ Verify workflow succeeded in Actions tab
3. ✅ SSH into Lightsail and verify service is running
4. ✅ Celebrate! No more manual deployments 🎉

**Your new workflow:**
```bash
# Make changes to BFF code
git add .
git commit -m "feat: add new endpoint"
git push origin main

# ☕ Grab coffee, deployment happens automatically
# ✅ Check GitHub Actions tab to see it succeed
```

---

**End of Setup Guide**
