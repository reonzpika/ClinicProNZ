# ClinicPro BFF — Lightsail Deployment Notes

Last updated: 2025-10-22

## 1) Server/Instance
- Provider: AWS Lightsail
- Region: ap-southeast-2 (Sydney)
- Instance name: clinicpro-bff-syd-1
- OS: Ubuntu 22.04 LTS
- Plan: 1 GB
- Networking: Dual-stack (IPv4/IPv6)
- Static IPv4: 13.236.58.12
- Egress IPv4 (curl -4 icanhazip.com): 13.236.58.12

## 2) Access (SSH)
- Default user: `ubuntu`
- Key: Using the default Lightsail SSH key for ap-southeast-2
- Example (Windows):
  ```bash
  ssh -i C:\Users\Ryo\Downloads\LightsailDefaultKey-ap-southeast-2.pem ubuntu@13.236.58.12
  ```
- Optional: Add personal public key to `/home/ubuntu/.ssh/authorized_keys` (owner `ubuntu:ubuntu`, perms `700` dir, `600` file).

## 3) Networking/Firewall
- Lightsail firewall: allow TCP 22 (SSH), 80 (HTTP), 443 (HTTPS)
- UFW on VM:
  ```bash
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  sudo ufw --force enable
  ```

## 4) Runtime & App
- Node.js: v20 (Nodesource), npm installed
- App user: `deployer`
- App directory: `/home/deployer/app`
- Process manager: systemd (pm2 not used due to EACCES issue)
- Current state: Placeholder app serving JSON on port 3000 and via nginx on 80

### systemd service
- Unit file: `/etc/systemd/system/clinicpro-bff.service`
- Contents:
  ```ini
  [Unit]
  Description=ClinicPro BFF (Node)
  After=network.target

  [Service]
  User=deployer
  Group=deployer
  WorkingDirectory=/home/deployer/app
  Environment=NODE_ENV=production PORT=3000
  ExecStart=/usr/bin/node index.js
  Restart=always
  RestartSec=3

  [Install]
  WantedBy=multi-user.target
  ```
- Commands:
  ```bash
  sudo systemctl status clinicpro-bff --no-pager
  sudo systemctl restart clinicpro-bff
  sudo journalctl -u clinicpro-bff -f
  ```

## 5) Web server (nginx)
- Config file used: `/etc/nginx/sites-available/default`
- Proxies all traffic to `http://127.0.0.1:3000`
- Commands:
  ```bash
  sudo nginx -t
  sudo systemctl reload nginx
  sudo systemctl status nginx --no-pager
  ```

## 6) Verification
- Local service: `curl -s http://127.0.0.1:3000`
- Public service: `curl -s http://13.236.58.12`
- Egress IP (for whitelisting): `curl -4 icanhazip.com` (result: 13.236.58.12)
- Systemd status: `sudo systemctl status clinicpro-bff --no-pager`

## 7) Deploying your repo (replace placeholder)
When `https://github.com/reonzpika/clinicpro-bff` has an actual Node app (with `package.json`):

```bash
# Stop service
sudo systemctl stop clinicpro-bff

# Replace placeholder with repo
sudo -u deployer bash -lc 'rm -rf /home/deployer/app && \
  git clone -b main https://github.com/reonzpika/clinicpro-bff.git /home/deployer/app && \
  cd /home/deployer/app && (npm ci || npm install)'

# If your app starts with "npm start", update ExecStart (one-time):
# sudo sed -i 's|ExecStart=/usr/bin/node index.js|ExecStart=/usr/bin/npm start --silent|' /etc/systemd/system/clinicpro-bff.service
# sudo systemctl daemon-reload

# Start service
sudo systemctl start clinicpro-bff
sudo systemctl status clinicpro-bff --no-pager
```

Notes:
- Ensure your repo has a start command the service expects:
  - If using `node index.js`, keep ExecStart as-is.
  - If using `npm start`, switch ExecStart to `npm start` (see sed above).

## 8) Backups & Updates
- Update OS periodically:
  ```bash
  sudo apt-get update -y && sudo apt-get upgrade -y
  ```
- Backup nginx config and service file before big changes:
  ```bash
  sudo cp /etc/nginx/sites-available/default ~/default.nginx.backup
  sudo cp /etc/systemd/system/clinicpro-bff.service ~/clinicpro-bff.service.backup
  ```

## 9) Domain & TLS (later)
When ready to use a domain (e.g., `api.clinicpro.co.nz`):
1. Create DNS A record → `13.236.58.12`
2. Install Certbot for nginx and obtain a cert:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api.clinicpro.co.nz -m ryo@clinicpro.co.nz --agree-tos --redirect
   ```
3. Test renewal: `sudo certbot renew --dry-run`

## 10) Troubleshooting
- PM2 EACCES: We are using systemd instead of pm2 to avoid permission issues.
- Port 80 shows default nginx page: reload nginx after updating config.
- App not starting: check service logs with `sudo journalctl -u clinicpro-bff -n 200 --no-pager`.
- Firewall: confirm Lightsail firewall rules and UFW.

## 11) Quick reference
```bash
# SSH
ssh -i ~/Downloads/LightsailDefaultKey-ap-southeast-2.pem ubuntu@13.236.58.12

# Service
sudo systemctl status clinicpro-bff --no-pager
sudo systemctl restart clinicpro-bff
sudo journalctl -u clinicpro-bff -f

# Nginx
sudo nginx -t && sudo systemctl reload nginx

# Verify
curl -s http://127.0.0.1:3000
curl -s http://13.236.58.12
curl -4 icanhazip.com
```