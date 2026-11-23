# Production server

This document covers how https://spectrumbusinessloans.com runs:
- the server and the services it uses;
- how deployment works, automatic from GitHub and by hand;
- how the server was set up, with every command;
- what to do when something breaks.

It describes the state on 2026-11-23. Update it whenever the server changes.

> The repository is public. Never put a password, a personal email address or a customer document in this file.
> Secrets live only on the server, in `/etc/spectrum/spectrum.env`, and in GitHub's encrypted secrets. Keep a copy of the SMTP login in the team's password manager.

## 1. At a glance

| | |
|---|---|
| Site | https://spectrumbusinessloans.com |
| Server | AWS EC2 `t2.medium`, region us-east-2 (Ohio): 2 vCPU, 3.8 GB RAM + 2 GB swap, 96 GB disk |
| Operating system | Ubuntu 26.04.1 LTS |
| Public IP | `18.226.86.0`. Not yet confirmed to be an Elastic IP (see [Open items](#13-open-items)) |
| Source code | `/var/www/spectrum`, a git clone of `nishit321/specdrum-financial`, branch `main`, owned by `ubuntu` |
| App | Next.js 16 (`output: 'standalone'`) on Node.js 22. It runs from `/var/www/spectrum/.next/standalone` |
| Process manager | PM2 7.0.4. One process, `spectrum`, running as user `spectrum` |
| Web server | nginx 1.28: HTTPS, redirects, upload size, timeouts |
| Certificate | Let's Encrypt through certbot, renewed automatically |
| Deploys | GitHub Actions: after CI passes on `main`, the server pulls, builds and restarts. A deploy can also run by hand |
| DNS | GoDaddy (nameservers `ns71/ns72.domaincontrol.com`) |
| Form email | SMTP through briskfern, `smtp.briskfern.com:465` |
| Database | None |

## 2. How it fits together

A visitor's request:

```
Browser ── spectrumbusinessloans.com ──► GoDaddy DNS ──► 18.226.86.0
   │
   ▼
AWS security group          lets in 22, 80, 443 only
   ▼
UFW firewall (server)       22, 80, 443
   ▼
nginx :80   ──301──► https://spectrumbusinessloans.com
nginx :443  TLS (Let's Encrypt), 20 MB request limit, 120 s timeouts
   │ proxy_pass
   ▼
Next.js server 127.0.0.1:3000      PM2 process "spectrum", runs as user "spectrum"
   │ form submissions only
   ▼
smtp.briskfern.com:465 (TLS) ──► owner's inbox (MAIL_TO)
```

A deploy:

```
merge into main ──► GitHub Actions: CI (lint, type-check, tests, build)
                       │ passed
                       ▼
                    "Deploy" workflow ── ssh deploy@server ──► sudo spectrum-deploy main
                                                                  │
            /var/www/spectrum:  git pull → npm ci → type-check → next build
                                → PM2 restart → health check
                       ▼
                    the workflow checks the live site over https
```

Why it is built this way:
- **One folder for code and the running site,** the way Atlas-Backend deploys. You can work with git directly in `/var/www/spectrum`.
  - The owner chose this on 2026-11-23, accepting the trade-off: **during each build (about a minute) the site is partly broken.** Pages may load without styling, and forms may fail. If a build fails, the site can stay broken until a build succeeds.
  - The deploy script narrows this: it type-checks before building, skips builds when nothing changed, and keeps going even if the connection that started it drops.
- **The code belongs to `ubuntu`; the app runs as `spectrum`.** `spectrum` has no sudo and no login, so a compromised app cannot become root. The app also handles SSNs.
- **The app listens on `127.0.0.1` only.** Visitors reach it only through nginx, which sets the real client IP and limits uploads.
- **Exactly one process.** Rate limits and the double-submit protection live in the process's memory. Never use PM2 cluster mode or more instances.

## 3. Services and accounts

| Service | Used for | Access and notes |
|---|---|---|
| AWS EC2 | The server | The AWS admin has console access; the dev team does not. The dev team logs in over SSH (PuTTY or WinSCP) as `ubuntu`, with the key file |
| GoDaddy | Domain registrar and DNS | The client's account, protected by 2-step verification (the client is in the US). GoDaddy's **Website Security** firewall blocks DNS edits; while it is on, saves fail with "Record could not be added" |
| GitHub | Code, pull requests, CI and deploys | Public repo `nishit321/specdrum-financial`. `main` = production, `develop` = integration. Collaborators: nishit321 (admin), hardik-kanani (write) |
| GitHub Actions | CI and the deploy | `.github/workflows/ci.yml` checks every PR and push. `.github/workflows/deploy.yml` deploys `main` after CI passes |
| Let's Encrypt | TLS certificate | certbot renews it through `certbot.timer`. It covers `spectrumbusinessloans.com` only, not yet `www` |
| briskfern | SMTP for the form emails | `smtp.briskfern.com`, port **465** (TLS from the first byte). Port 587 is closed there. **Messages are capped at 10 MB** |
| NodeSource | Node.js 22 packages | apt repository `deb.nodesource.com/node_22.x` |
| npm | PM2 | `pm2@7.0.4`, installed globally |
| Microsoft 365 | The company mailbox on this domain | Not part of the website, but its DNS records share the zone. Never change them |

## 4. Files and folders on the server

| Path | What it is |
|---|---|
| `/var/www/spectrum/` | The source code: a git clone, owned by `ubuntu`. Builds run here |
| `/var/www/spectrum/.next/standalone/` | The built app PM2 runs (recreated by every build) |
| `/var/www/spectrum/.next/standalone/.deployed-sha` | The commit of the last successful deploy |
| `/etc/spectrum/spectrum.env` | Settings and secrets (SMTP login, recipients). `root:spectrum`, mode `640` |
| `/etc/spectrum/ecosystem.config.js` | PM2's description of the app |
| `/var/lib/spectrum/` | Home of user `spectrum`. PM2's own files are in `.pm2/`, including logs and the saved process list |
| `/etc/systemd/system/pm2-spectrum.service` | Starts PM2, and through it the app, at boot |
| `/usr/local/bin/spm2` | Runs `pm2` as `spectrum`. Always use `sudo spm2 …` |
| `/usr/local/bin/spectrum-deploy` | The deploy script |
| `/var/log/spectrum-deploy/` | One log per deploy, kept 30 days |
| `/usr/local/bin/spectrum-smtp-check` | Tests the SMTP login without sending mail |
| `/etc/logrotate.d/spectrum-pm2` | Rotates PM2's logs daily and keeps 14 days |
| `/etc/sudoers.d/spectrum-deploy` | Lets user `deploy` run exactly `spectrum-deploy main` |
| `/home/deploy/.ssh/authorized_keys` | GitHub's deploy key, locked to that one command |
| `/etc/nginx/sites-available/spectrum` | The nginx site, linked from `sites-enabled/`. The default site is removed |
| `/etc/letsencrypt/live/spectrumbusinessloans.com/` | Certificate and key |
| `/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh` | Reloads nginx after each renewal |
| `/swapfile` | 2 GB swap, listed in `/etc/fstab` |

Leftovers from earlier set-ups, to delete once the owner agrees (see [Open items](#13-open-items)):
- `/var/www/spectrum-old-20261123` (the previous layout);
- `/etc/systemd/system/spectrum.service` (disabled);
- the backups in `/root`: `spectrum-nginx.bak`, `spectrum-deploy.systemd.bak`, `spectrum-deploy.releases.bak`, `spectrum-deploy.inplace-v1.bak`.

The server has three users:
- **`ubuntu`:** admin with sudo. It is used for SSH, owns the code, and runs git and the builds.
- **`spectrum`:** system user without login or sudo. It runs PM2 and the app.
- **`deploy`:** no password and no sudo group. Its SSH key can only start `spectrum-deploy main`.

## 5. Deploying

### 5.1 Three ways to deploy

1. **Automatic: the normal way.**
   1. Work on a feature branch and open a pull request into `develop`.
   2. Release: open a pull request from `develop` into `main`. Merge only when every check is green and the owner says yes.
   3. CI runs on `main`. When it passes, the **Deploy** workflow deploys `main` by itself. Follow it under GitHub → Actions → Deploy.
2. **From GitHub by hand:** Actions → **Deploy** → **Run workflow**. It deploys the current `main`, but only if CI passed on that commit.
3. **On the server by hand:**

   ```bash
   sudo /usr/local/bin/spectrum-deploy main
   ```

   For a deploy after your own `git pull` or checkout, see [5.3](#53-working-with-git-on-the-server).

### 5.2 What the deploy script does

`sudo spectrum-deploy main` runs these steps:

1. **Runs in the background.** The deploy runs on its own and writes everything to `/var/log/spectrum-deploy/<date>.log`, while the screen or the GitHub run follows that log. If the SSH connection drops, the GitHub run is cancelled, or you press Ctrl+C, only the following stops; the deploy itself finishes (tested).
2. **Takes a lock,** so two deploys cannot run at once ("Another deploy is running").
3. **Refuses, without changing anything,** when the folder:
   - is not on `main`;
   - has uncommitted changes;
   - has commits that are not on GitHub.
4. **`git pull --ff-only origin main`.**
5. **Skips the build when there is nothing to build:**
   - the live build is already this commit, or only `docs/` and `*.md` files changed since it;
   - and the site is healthy.

   This avoids the build's minute of broken site. A broken site is always rebuilt.
6. **`npm ci --ignore-scripts`.** No package's install script runs on the server.
7. **Type-checks** the same files CI checks. On a type error it stops **before** the build, so the running site is not touched.
8. **`npm run build`.** It then copies `public/` and `.next/static/` into `.next/standalone/`.
9. **Restarts the app with PM2.** It then waits up to 30 s for `/`, `/apply-now`, the stylesheet and `/img/logo.png` to load.
10. **Finishes.** It records the commit in `.next/standalone/.deployed-sha` and saves PM2's process list for the next boot.

If step 8 or 9 fails, there is no automatic way back. The script prints the previous commit and the command to return to it ([5.5](#55-going-back-to-an-earlier-version)).

One `curl: (7) ... Could not connect` line during step 9 is normal: the app takes a second to start.

### 5.3 Working with git on the server

The code in `/var/www/spectrum` belongs to `ubuntu`, so you work there as yourself, without sudo:

```bash
cd /var/www/spectrum
git status
git branch -a
git log --oneline -5
git pull origin main
```

To make what is checked out live, for example after your own `git pull` or a checkout of another commit:

```bash
sudo /usr/local/bin/spectrum-deploy --no-pull
```

`--no-pull` builds and restarts whatever is in the folder, uncommitted edits included. It does not pull and does not skip the build.

Rules:
- **The automatic deploy only works when the folder is clean and on `main`.** Edits made with nano and left uncommitted, or a checked-out branch, make every deploy refuse until you commit and push them, discard them (`git checkout -- .`), or switch back (`git checkout main`).
- **Run git without `sudo`.** A `sudo git …` leaves root-owned files behind. The deploy script resets ownership to `ubuntu` each time, but your own next `git` command may fail before that.
- **Pushing from the server needs a GitHub login,** which is not set up yet (see [Open items](#13-open-items)). Commits also need an identity once:

  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "you@example.com"
  ```

- **A push to `main` deploys itself.** Prefer a branch and a pull request, so CI and a review come first.

### 5.4 Checks after a deploy

The Deploy workflow runs these checks by itself. To run them from any computer:

```bash
# every page should answer 200
for p in / /about /apply-now /loan-calculator /loan-types /quote-request /services /the-process \
         /testimonials /privacy-policy /terms-of-service /disclaimer; do
  printf "%-20s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "https://spectrumbusinessloans.com$p"
done

# the forms must not be refused by the same-origin check:
# expect 400 with "error":"validation"; a 403 means refused
curl -s -X POST https://spectrumbusinessloans.com/api/quote \
  -H 'Origin: https://spectrumbusinessloans.com' -H 'Content-Type: application/json' \
  -d '{"form":"home-quote","idempotencyKey":"deploy-check-0000000000","data":{}}'
```

These checks send no email.

### 5.5 Going back to an earlier version

There is only one build on the server, so going back means building the older commit again (about 3 minutes):

```bash
cd /var/www/spectrum
git log --oneline -10                 # find the commit to return to, e.g. 36b96fe
git checkout 36b96fe                  # put that commit here
sudo /usr/local/bin/spectrum-deploy --no-pull
```

The folder is now on a detached commit, and automatic deploys refuse until you return to `main`.

The lasting fix is a revert on GitHub through a pull request. After it is merged:

```bash
cd /var/www/spectrum
git checkout main
sudo /usr/local/bin/spectrum-deploy main
```

## 6. Settings (`/etc/spectrum/spectrum.env`)

| Variable | On the server | Meaning |
|---|---|---|
| `SMTP_HOST` | `smtp.briskfern.com` | Mail server |
| `SMTP_PORT` | `465` | Port 587 is closed at briskfern |
| `SMTP_SECURE` | `true` | TLS from the first byte; required on 465 |
| `SMTP_USER`, `SMTP_PASS` | the briskfern mailbox login | Put the password in single quotes: `SMTP_PASS='...'` |
| `MAIL_FROM` | that mailbox, e.g. `"Spectrum Financial Website <mailbox@domain>"` | Sender. It must be an address the SMTP account may send as |
| `MAIL_TO` | the recipients | Comma separated. Production recipient: `david@spectrumbusinessfinance.com` |
| `APP_TIMEZONE` | `America/Los_Angeles` | Dates on the PDF |
| `TRUSTED_PROXY_HOPS` | `1` | nginx is the only proxy in front of the app. Used for the signer IP on the PDF and for rate limits |

Each line is `NAME=value`. A stray line such as a lone `=` breaks `spectrum-smtp-check`; one was found and removed on 2026-11-23.

To change a setting:

```bash
sudo nano /etc/spectrum/spectrum.env        # save: Ctrl+O, Enter, Ctrl+X
sudo /usr/local/bin/spectrum-smtp-check     # after SMTP changes; sends no mail
sudo spm2 restart spectrum
```

These settings are read at start-up, so a restart is enough.

The one exception is `NEXT_PUBLIC_UPLOAD_MAX_TOTAL_MB`, the total size of bank statements on Apply Now (default 15). The build bakes it in. To change it, write it into `/var/www/spectrum/.env.production`, which Git ignores, then rebuild:

```bash
echo 'NEXT_PUBLIC_UPLOAD_MAX_TOTAL_MB=6' > /var/www/spectrum/.env.production
sudo /usr/local/bin/spectrum-deploy --no-pull
```

This has not been done yet (see [Open items](#13-open-items)). If you raise the limit, keep nginx's `client_max_body_size` at least 2 MB above it.

## 7. Everyday commands

```bash
# app (PM2): always through spm2, never a bare "pm2"
sudo spm2 ls                                  # status
sudo spm2 restart spectrum
sudo spm2 logs spectrum --lines 50 --nostream # last 50 log lines
sudo spm2 logs spectrum                       # follow live (Ctrl+C stops)
sudo spm2 describe spectrum                   # paths, restarts, uptime

# deploys
sudo /usr/local/bin/spectrum-deploy main      # deploy (skips the build when nothing changed)
ls -t /var/log/spectrum-deploy/ | head        # deploy logs, newest first
cat /var/www/spectrum/.next/standalone/.deployed-sha   # commit that is live

# nginx
sudo nginx -t                                 # test the config before reloading
sudo systemctl reload nginx
sudo tail -n 50 /var/log/nginx/error.log
sudo tail -n 50 /var/log/nginx/access.log

# certificate
sudo certbot certificates                     # names and expiry date
sudo certbot renew --dry-run                  # practice renewal, changes nothing
systemctl list-timers | grep certbot          # next automatic renewal check

# mail
sudo /usr/local/bin/spectrum-smtp-check       # SMTP login test, sends no mail

# machine
df -h /                                       # disk
free -h                                       # memory and swap
sudo ufw status
sudo apt update && sudo apt -y upgrade        # updates
```

nginx and the app start by themselves after `sudo reboot`. PM2's boot service restores the saved process list.

App logs record events, references, client IPs and mail-server errors. They never record form contents such as names or SSNs.

## 8. CI/CD (GitHub Actions)

The **Deploy** workflow, `.github/workflows/deploy.yml`, has three steps:
- **Starts** when the **CI** workflow succeeds on a push to `main`, or by hand (Run workflow). GitHub runs this kind of workflow only from the default branch, `main`.
- **Checks** that CI passed on the commit `main` points at. If `main` has already moved on, it skips: the newer commit deploys after its own CI run.
- **Connects** as `deploy@spectrumbusinessloans.com` and lets the server run `spectrum-deploy main`. It then checks five pages and images, plus the form API, over https.

Deploys queue rather than overlap.

The workflow uses three repository secrets:
- `DEPLOY_SSH_KEY`: the private key; its public half is in `/home/deploy/.ssh/authorized_keys`;
- `DEPLOY_HOST`: `spectrumbusinessloans.com`;
- `DEPLOY_KNOWN_HOSTS`: the server's SSH host key. Its fingerprint is `SHA256:GIK1mqqbWT1ucGQjpiVAL+BTeO34jpgCSJSLGuEa9RM`.

What the deploy key can do:
- It works only for user `deploy`. Its `authorized_keys` line is `restrict,command="sudo -n /usr/local/bin/spectrum-deploy main"`.
- That means no shell, no other command and no forwarding. The command sent from GitHub is ignored.
- sudoers allows `deploy` exactly that command, with the argument `main`.
- Even a leaked key can only redeploy GitHub's `main`.

To replace the key:
1. Make a new pair with `ssh-keygen -t ed25519 -f gh-deploy -N "" -C github-actions-deploy`.
2. Put the public half into `authorized_keys` behind the same `restrict,command=...` prefix.
3. Put the private half into `DEPLOY_SSH_KEY`.
4. Delete both local files.

If a Deploy run fails:
- **Failed at "Deploy over SSH" with a timeout:** GitHub's runners cannot reach port 22. The AWS admin must allow 22 from `0.0.0.0/0`. Key-only login and the locked key keep that safe.
- **Failed at "Deploy over SSH" after the server started:** read the run's log, or `/var/log/spectrum-deploy/` on the server. The script's `!!` lines say what to do.
- **Failed at "Check the live site":** see [Troubleshooting](#12-troubleshooting).

## 9. Building the server from scratch

These are the commands that produce the current server, in the right order.

Run each block as `ubuntu` over SSH and paste it whole. In PuTTY, a right-click pastes.

### 9.1 AWS console (AWS admin)

- Launch an Ubuntu LTS instance, `t2.medium` or larger. With swap, the build needs about 2 GB of RAM.
- Allocate an **Elastic IP** and associate it with the instance. Without one, a stop/start changes the IP.
- Security group, inbound:
  - 22 from `0.0.0.0/0`, because GitHub Actions deploys over SSH and its addresses change;
  - 80 and 443 from `0.0.0.0/0` and `::/0`;
  - nothing else. Port 3000 stays closed.

### 9.2 Updates and swap

```bash
sudo apt update && sudo apt -y upgrade
[ -f /var/run/reboot-required ] && sudo reboot
```

If a "restart services" screen appears, press Enter. If a config-file question appears, keep the current file (N).

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 9.3 Node.js 22, git, nginx, certbot, PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
sudo bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm install -g pm2@7.0.4
node -v      # v22.x
```

Ubuntu's own `nodejs` package is too old, so Node comes from NodeSource.

Ubuntu 26.04 uses `sudo-rs`, so run scripts with `sudo bash script.sh`, not `sudo -E`.

### 9.4 Firewall

Allow SSH **before** enabling the firewall, or the session is cut.

Paste `sudo ufw enable` on its own line and answer `y`. Its y/n prompt swallows the next pasted line.

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

```bash
sudo ufw enable
```

### 9.5 Users

```bash
cd /
sudo adduser --system --group --home /var/lib/spectrum --shell /usr/sbin/nologin spectrum
sudo install -d -m 750 -o spectrum -g spectrum /var/lib/spectrum
sudo adduser --disabled-password --comment "GitHub Actions deploy" --shell /bin/sh deploy
```

### 9.6 Settings file

Fill in `SMTP_USER`, `SMTP_PASS` (in single quotes), `MAIL_FROM` and `MAIL_TO`. Until `MAIL_TO` is filled, the forms answer "we couldn't send this, call us" and send nothing.

```bash
sudo mkdir -p /etc/spectrum
sudo tee /etc/spectrum/spectrum.env > /dev/null <<'EOF'
SMTP_HOST=smtp.briskfern.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
MAIL_FROM="Spectrum Financial Website <mailbox@domain>"
MAIL_TO=
APP_TIMEZONE=America/Los_Angeles
TRUSTED_PROXY_HOPS=1
EOF
sudo chown root:spectrum /etc/spectrum/spectrum.env
sudo chmod 640 /etc/spectrum/spectrum.env
sudo nano /etc/spectrum/spectrum.env
```

### 9.7 Code

```bash
cd /
sudo install -d -o ubuntu -g ubuntu /var/www/spectrum
git clone --branch main https://github.com/nishit321/specdrum-financial.git /var/www/spectrum
```

### 9.8 PM2: wrapper and app description

`spm2` changes into `/var/lib/spectrum` first. Run from your home folder instead, PM2 fails with `EACCES`, because `spectrum` cannot enter `/home/ubuntu`.

```bash
sudo tee /usr/local/bin/spm2 > /dev/null <<'EOF'
#!/bin/sh
# Runs pm2 as the app user "spectrum". Usage: sudo spm2 <pm2 arguments>
# cd first: "spectrum" cannot enter the caller's home folder, and pm2 fails there with EACCES
cd /var/lib/spectrum || exit 1
exec runuser -u spectrum -- env HOME=/var/lib/spectrum PM2_HOME=/var/lib/spectrum/.pm2 /usr/bin/pm2 "$@"
EOF
sudo chmod 755 /usr/local/bin/spm2

sudo tee /etc/spectrum/ecosystem.config.js > /dev/null <<'EOF'
// PM2 process for the Spectrum Financial site.
// Start or reload: sudo spm2 startOrRestart /etc/spectrum/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'spectrum',
      cwd: '/var/www/spectrum/.next/standalone',
      script: 'server.js',
      // one process only: the rate limits and the double-submit protection live in its memory
      exec_mode: 'fork',
      instances: 1,
      // node reads the settings itself, so the secrets never land in pm2's dump file
      node_args: '--env-file=/etc/spectrum/spectrum.env',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '127.0.0.1',
        NEXT_TELEMETRY_DISABLED: '1',
      },
      autorestart: true,
      restart_delay: 5000,
      time: true,
    },
  ],
};
EOF
sudo chmod 644 /etc/spectrum/ecosystem.config.js
```

After editing `ecosystem.config.js`, reload it once with:

```bash
sudo spm2 delete spectrum && sudo spm2 start /etc/spectrum/ecosystem.config.js && sudo spm2 save
```

`restart` alone keeps the old settings.

### 9.9 Deploy script

```bash
sudo tee /usr/local/bin/spectrum-deploy > /dev/null <<'EOF'
#!/usr/bin/env bash
# Deploys the site from the git folder /var/www/spectrum: git pull, build, PM2 restart.
# Usage: sudo /usr/local/bin/spectrum-deploy [branch]    pull that branch (default: main), then build and restart
#        sudo /usr/local/bin/spectrum-deploy --no-pull   build and restart what is checked out now (after your own git pull)
# Every run is logged in /var/log/spectrum-deploy/.
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Run with sudo"; exit 1; }

# The deploy runs in its own session with its output in a log file; this part only follows the log.
# A dropped SSH connection or a cancelled GitHub run then stops the follower, never the deploy:
# dying halfway through a build would leave the site broken.
LOGDIR=/var/log/spectrum-deploy
if [ -z "${SPECTRUM_DEPLOY_DETACHED:-}" ]; then
  mkdir -p "$LOGDIR"
  find "$LOGDIR" -name '*.log' -mtime +30 -delete
  log="$LOGDIR/$(date +%Y%m%d-%H%M%S).log"
  SPECTRUM_DEPLOY_DETACHED=1 setsid -w "$0" "$@" > "$log" 2>&1 < /dev/null &
  pid=$!
  tail -n +1 -f "$log" &
  follower=$!
  rc=0
  wait "$pid" || rc=$?
  sleep 1
  kill "$follower" 2>/dev/null || true
  echo "(log: $log)"
  exit "$rc"
fi

APP=/var/www/spectrum
OWNER=ubuntu
ECOSYSTEM=/etc/spectrum/ecosystem.config.js
MARKER="$APP/.next/standalone/.deployed-sha"
as_owner() { runuser -u "$OWNER" -- env HOME="/home/$OWNER" NEXT_TELEMETRY_DISABLED=1 "$@"; }
# 9>&-: a pm2 daemon started from here must not inherit the deploy lock, or it would hold it for good
pm2_app() { /usr/local/bin/spm2 "$@" 9>&-; }

healthy() {
  local html css re='(/_next/static/[^"]*\.css)'
  curl -fsS -o /dev/null http://127.0.0.1:3000/ || return 1
  curl -fsS -o /dev/null http://127.0.0.1:3000/apply-now || return 1
  # the stylesheet (.next/static) and an image (public/) must load too
  html=$(curl -fsS http://127.0.0.1:3000/) || return 1
  [[ $html =~ $re ]] || return 1
  css=${BASH_REMATCH[1]}
  curl -fsS -o /dev/null "http://127.0.0.1:3000$css" || return 1
  curl -fsS -o /dev/null http://127.0.0.1:3000/img/logo.png || return 1
}

exec 9>/run/spectrum-deploy.lock
flock -n 9 || { echo "Another deploy is running"; exit 1; }
echo "==> Deploy started $(date -u +%Y-%m-%dT%H:%M:%SZ)"

PULL=1
BRANCH="${1:-main}"
if [ "$BRANCH" = "--no-pull" ]; then PULL=0; fi

cd "$APP"
# a "sudo git ..." by hand leaves root-owned files that block the next git or npm step
chown -R "$OWNER:$OWNER" "$APP"
PREV_SHA=$(as_owner git rev-parse --short HEAD)

if [ "$PULL" -eq 1 ]; then
  CURRENT=$(as_owner git rev-parse --abbrev-ref HEAD)
  if [ "$CURRENT" != "$BRANCH" ]; then
    echo "!! The server folder is on branch '$CURRENT', not '$BRANCH'. Nothing was changed."
    echo "   Switch back first:  cd $APP && git checkout $BRANCH"
    exit 1
  fi
  if [ -n "$(as_owner git status --porcelain)" ]; then
    echo "!! The server folder has uncommitted changes. Nothing was changed:"
    as_owner git status --short
    echo "   Commit and push them, or discard them (git checkout -- . ), then deploy again."
    exit 1
  fi
  echo "==> Pulling $BRANCH"
  as_owner git pull --ff-only origin "$BRANCH"
  if [ "$(as_owner git rev-parse HEAD)" != "$(as_owner git rev-parse "origin/$BRANCH")" ]; then
    echo "!! The server folder has commits that are not on GitHub ($BRANCH). Push them first. Nothing was built."
    exit 1
  fi
else
  echo "==> Building what is checked out now (no pull)"
  as_owner git status --short
fi
SHA=$(as_owner git rev-parse --short HEAD)
echo "==> $PREV_SHA -> $SHA"

# Every build blanks the site for about a minute, so skip it when there is nothing to build:
# the live build is already this commit, or only docs changed since it. A broken site is rebuilt.
if [ "$PULL" -eq 1 ] && [ -f "$MARKER" ]; then
  LIVE_SHA=$(cat "$MARKER")
  reason=""
  if [ "$LIVE_SHA" = "$SHA" ]; then
    reason="the live build is already $SHA"
  elif as_owner git cat-file -e "$LIVE_SHA^{commit}" 2>/dev/null && \
       [ -z "$(as_owner git diff --name-only "$LIVE_SHA" "$SHA" | grep -vE '^docs/|\.md$' || true)" ]; then
    reason="only docs changed since $LIVE_SHA"
  fi
  if [ -n "$reason" ] && healthy; then
    echo "==> Nothing to build: $reason, and the site is healthy."
    echo "==> Done: $SHA is live"
    exit 0
  fi
fi

echo "==> Installing packages"
# --ignore-scripts: no package's install script runs on the server (none is needed today)
as_owner npm ci --no-audit --no-fund --ignore-scripts

# Type errors are the usual reason a build fails. Check first, the way CI does: the build
# deletes the running site's files as soon as it starts, so it must not start on broken code.
echo "==> Type-checking"
TSCHECK=$(as_owner mktemp -d)
as_owner tee "$TSCHECK/tsconfig.json" > /dev/null <<JSON
{
  "extends": "$APP/tsconfig.json",
  "compilerOptions": { "incremental": false },
  "include": ["$APP/**/*.ts", "$APP/**/*.tsx"],
  "exclude": ["$APP/node_modules", "$APP/legacy-html", "$APP/next-env.d.ts", "$APP/.next"]
}
JSON
if ! as_owner "$APP/node_modules/.bin/tsc" --noEmit -p "$TSCHECK/tsconfig.json"; then
  rm -rf "$TSCHECK"
  echo "!! Type errors. The build did not start and the running site was not touched."
  exit 1
fi
rm -rf "$TSCHECK"

echo "==> Building"
if ! as_owner npm run build; then
  echo "!! The build failed. The app was NOT restarted, but the running site may be missing"
  echo "   styles and pages until a build succeeds. Previous commit: $PREV_SHA"
  echo "   Back to it:  cd $APP && git checkout $PREV_SHA && sudo /usr/local/bin/spectrum-deploy --no-pull"
  exit 1
fi
as_owner mkdir -p .next/standalone/public .next/standalone/.next/static
# "dir/." merges into the target: the standalone build can already hold part of public/
as_owner cp -a public/. .next/standalone/public/
as_owner cp -a .next/static/. .next/standalone/.next/static/

echo "==> Restarting the app"
pm2_app startOrRestart "$ECOSYSTEM"

ok=0
for _ in $(seq 1 30); do
  if healthy; then ok=1; break; fi
  sleep 1
done
if [ "$ok" -ne 1 ]; then
  echo "!! The new build does not work (pages, stylesheet or images)."
  pm2_app logs spectrum --lines 30 --nostream || true
  echo "   Previous commit: $PREV_SHA"
  echo "   Back to it:  cd $APP && git checkout $PREV_SHA && sudo /usr/local/bin/spectrum-deploy --no-pull"
  exit 1
fi
as_owner sh -c 'printf "%s\n" "$1" > "$2"' _ "$SHA" "$MARKER"
# remember the process list for the next boot
pm2_app save

echo "==> Done: $SHA is live"
EOF
sudo chmod 755 /usr/local/bin/spectrum-deploy
```

The script lives in `/usr/local/bin`, owned by root. It runs as root, so neither `spectrum` nor `deploy` may be able to change it.

### 9.10 SMTP check

```bash
sudo tee /usr/local/bin/spectrum-smtp-check > /dev/null <<'EOF'
#!/usr/bin/env bash
# Logs in to the SMTP server with the site's settings. Sends no email.
set -euo pipefail
set -a; . /etc/spectrum/spectrum.env; set +a
cd /var/www/spectrum
exec runuser -u spectrum -- node -e '
const e = process.env, port = Number(e.SMTP_PORT);
const secure = e.SMTP_SECURE ? /^(1|true|yes)$/i.test(e.SMTP_SECURE.trim()) : port === 465;
require("nodemailer").createTransport({
  host: e.SMTP_HOST, port, secure, requireTLS: !secure,
  auth: e.SMTP_USER ? { user: e.SMTP_USER.trim(), pass: e.SMTP_PASS } : undefined,
}).verify()
  .then(() => console.log("SMTP OK: connection and login work"))
  .catch((err) => { console.error("SMTP FAILED: " + err.message); process.exit(1); });
'
EOF
sudo chmod 755 /usr/local/bin/spectrum-smtp-check
```

It needs `node_modules` in `/var/www/spectrum`, which exists after the first build.

### 9.11 First build, then start at boot

The first build starts the app under PM2.

Then:
1. `pm2 startup` creates the boot service `pm2-spectrum`.
2. The running PM2 is handed over to that service. This also proves that a reboot brings the app back.

```bash
cd /
sudo /usr/local/bin/spectrum-deploy --no-pull
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u spectrum --hp /var/lib/spectrum
sudo spm2 save
sudo spm2 kill
sudo systemctl start pm2-spectrum
sudo spm2 ls
```

### 9.12 PM2 log rotation

```bash
sudo tee /etc/logrotate.d/spectrum-pm2 > /dev/null <<'EOF'
/var/lib/spectrum/.pm2/logs/*.log /var/lib/spectrum/.pm2/pm2.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    su spectrum spectrum
}
EOF
sudo logrotate -d /etc/logrotate.d/spectrum-pm2 2>&1 | grep -iE "error|considering log"
```

### 9.13 nginx, first version (HTTP only)

This version serves the site over plain HTTP until the certificate exists. certbot also needs it in step 9.15.

```bash
sudo tee /etc/nginx/sites-available/spectrum > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name spectrumbusinessloans.com www.spectrumbusinessloans.com;
    server_tokens off;

    client_max_body_size 20m;
    client_body_timeout 120s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/spectrum /etc/nginx/sites-enabled/spectrum
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

The settings that matter:

| Setting | Why |
|---|---|
| `client_max_body_size 20m` | Bank statements of up to 15 MB plus the form. nginx's default of 1 MB would block them |
| `120s` timeouts | Slow uploads from phones |
| `Host` / `X-Forwarded-Host` | Without them the forms' same-origin check refuses every post with 403 |
| `X-Forwarded-For` | The real visitor IP for the PDF and the rate limits |

Test only with made-up data until HTTPS is on, because plain HTTP is not encrypted.

### 9.14 DNS at GoDaddy

1. Turn off **Website Security → Firewall** first if saves fail with "Record could not be added".
2. Set `A @` → server IP, TTL 600 s.
3. Set `A www` → server IP, TTL 600 s.
4. Leave **exactly one** A record per name. A second, old record sends some visitors, and Let's Encrypt, to the old server.
5. Check what GoDaddy itself serves. The `-debug` output lists every record, while plain `nslookup` may show only the first:

   ```
   nslookup -debug -type=A spectrumbusinessloans.com ns71.domaincontrol.com
   nslookup -debug -type=A www.spectrumbusinessloans.com ns71.domaincontrol.com
   ```

See [section 10](#10-dns-records) for the records that must not change.

### 9.15 HTTPS

1. Get the certificate. The domain must already point at the server.

   ```bash
   sudo certbot --nginx -d spectrumbusinessloans.com
   ```

   Once `www` has a single, correct A record, use `-d spectrumbusinessloans.com -d www.spectrumbusinessloans.com` instead.

2. Install the final nginx config. It does three things:
   - every `http://` request, `www` and the bare IP go to `https://spectrumbusinessloans.com`;
   - the site runs only over HTTPS;
   - if the config test fails, the old file is put back.

```bash
sudo cp /etc/nginx/sites-available/spectrum /root/spectrum-nginx.bak
sudo tee /etc/nginx/sites-available/spectrum > /dev/null <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name spectrumbusinessloans.com www.spectrumbusinessloans.com;
    server_tokens off;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    location / {
        return 301 https://spectrumbusinessloans.com$request_uri;
    }
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    http2 on;
    server_name spectrumbusinessloans.com;
    server_tokens off;

    ssl_certificate /etc/letsencrypt/live/spectrumbusinessloans.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/spectrumbusinessloans.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    if ($host != spectrumbusinessloans.com) {
        return 301 https://spectrumbusinessloans.com$request_uri;
    }

    client_max_body_size 20m;
    client_body_timeout 120s;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
EOF
if sudo nginx -t; then sudo systemctl reload nginx && echo "OK: new config live"; else sudo cp /root/spectrum-nginx.bak /etc/nginx/sites-available/spectrum && echo "!! test failed, old config restored"; fi
```

3. Make every renewal reload nginx, then run a practice renewal:

```bash
sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh > /dev/null <<'EOF'
#!/bin/sh
systemctl reload nginx
EOF
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo certbot renew --dry-run
```

The practice renewal should end with `Congratulations, all simulated renewals succeeded`.

### 9.16 The deploy user and GitHub

1. Let `deploy` run exactly one command as root:

   ```bash
   echo 'deploy ALL=(root) NOPASSWD: /usr/local/bin/spectrum-deploy main' | sudo tee /etc/sudoers.d/spectrum-deploy > /dev/null
   sudo chmod 440 /etc/sudoers.d/spectrum-deploy
   sudo visudo -c -f /etc/sudoers.d/spectrum-deploy
   sudo -l -U deploy
   ```

2. Make a key pair on your own computer:

   ```bash
   ssh-keygen -t ed25519 -f gh-deploy -N "" -C github-actions-deploy
   ```

3. Install the **public** half (`gh-deploy.pub`) for `deploy`, locked to that one command:

   ```bash
   sudo install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
   echo 'restrict,command="sudo -n /usr/local/bin/spectrum-deploy main" <contents of gh-deploy.pub>' | sudo tee /home/deploy/.ssh/authorized_keys > /dev/null
   sudo chown deploy:deploy /home/deploy/.ssh/authorized_keys
   sudo chmod 600 /home/deploy/.ssh/authorized_keys
   ```

4. Store the three secrets: in GitHub under Settings → Secrets and variables → Actions → New repository secret, or with the `gh` CLI. Then delete `gh-deploy` and `gh-deploy.pub`.

   ```bash
   gh secret set DEPLOY_SSH_KEY --repo nishit321/specdrum-financial < gh-deploy
   gh secret set DEPLOY_HOST --repo nishit321/specdrum-financial --body spectrumbusinessloans.com
   ssh-keyscan -t ed25519 spectrumbusinessloans.com | gh secret set DEPLOY_KNOWN_HOSTS --repo nishit321/specdrum-financial
   ```

5. Compare the host key's fingerprint with the server's own:

   ```bash
   ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
   ```

Then run the checks in [5.4](#54-checks-after-a-deploy).

## 10. DNS records

These are the records in GoDaddy's zone for `spectrumbusinessloans.com`.

| Record | Points to | Belongs to | Change? |
|---|---|---|---|
| `A @` | `18.226.86.0` | this server | Only if the server IP changes |
| `A www` | `18.226.86.0`, **plus an old `160.153.0.165`** | this server, plus GoDaddy's old "Coming Soon" page | Delete the `160.153.0.165` row |
| `MX @` | `spectrumbusinessloans-com.mail.protection.outlook.com` | Microsoft 365 email | **Never** |
| `TXT @` | `v=spf1 include:secureserver.net include:spf.mandrillapp.com -all` and `NETORGFT11840102.onmicrosoft.com` | Email (SPF, Microsoft) | **Never** |
| `CNAME autodiscover` | `autodiscover.outlook.com` | Outlook set-up | **Never** |
| `A apply-now` | GoDaddy forwarding → `spectrumbusinessfinance.com/loan-application` | GoDaddy forwarding (locked) | **Never** here |
| `A loan-calculator` | GoDaddy forwarding → `spectrumsbaloans.com/loan-calculator/` | GoDaddy forwarding (locked) | **Never** here |
| `A my-offer` | GoDaddy forwarding → `spectrumfinancial.biz` | GoDaddy forwarding (locked) | **Never** here |
| `A sba` | GoDaddy forwarding → `smartbizloans.com/partner/…` | GoDaddy forwarding (locked) | **Never** here |
| `A _websec` | GoDaddy Website Security | GoDaddy | **Never** |

A forward is changed in GoDaddy's forwarding settings, never in DNS.

## 11. Security in place

- The app runs as `spectrum`, which has no sudo, and listens only on `127.0.0.1:3000`. It can read the code but not change it.
- Secrets exist only in `/etc/spectrum/spectrum.env` (readable by root and `spectrum`) and in GitHub's encrypted secrets.
  - Node reads the file itself, so the secrets are not stored in PM2's dump file (checked).
  - `.env` files and `pdf/` are gitignored and never committed.
- The deploy key can only run `spectrum-deploy main` (a forced command plus sudoers). SSH accepts keys only: no passwords, and no password login for root.
- Deploys install packages with `--ignore-scripts`, so no install script from a dependency runs on the server.
- The firewalls admit only 22, 80 and 443: the AWS security group and UFW both. Port 3000 is closed from outside (checked 2026-11-17).
- TLS 1.2 and 1.3 only. HTTP, `www` and the bare IP redirect to HTTPS.
- The app sends these headers: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- API responses are `Cache-Control: no-store`.
- The forms:
  - refuse posts from other sites (403);
  - limit the rate per visitor IP;
  - check uploads by their content;
  - never put the full SSN in the email body. It appears only in the attached PDF.
- nginx hides its version (`server_tokens off`).

Known gaps, which need the repo admin (see [Open items](#13-open-items)):
- `main` has no branch protection. Anyone with write access can push straight to it, and that push deploys. Build steps run as `ubuntu`, which has sudo.
- The deploy secrets are repository-wide. A write collaborator could read them through a workflow on another branch. The key can only redeploy, but repeated redeploys mean repeated minutes of broken site.

## 12. Troubleshooting

| Symptom | What to do |
|---|---|
| **502 Bad Gateway** | The app is down. Run `sudo spm2 ls`, then `sudo spm2 logs spectrum --lines 50 --nostream`. Restart: `sudo spm2 restart spectrum`. If `spm2 ls` is empty: `sudo spm2 resurrect` |
| Site without styling, or forms fail, for about a minute | A build is running (normal with this layout). If it lasts longer, read the newest log in `/var/log/spectrum-deploy/` |
| Deploy: `server folder is on branch …` / `uncommitted changes` / `commits that are not on GitHub` | Someone worked in `/var/www/spectrum` by hand. Commit and push, discard (`git checkout -- .`), or `git checkout main`. Then deploy again |
| Deploy: `Type errors` | Nothing was touched. Fix the code on GitHub; CI should have caught it |
| Deploy: `The build failed` / `does not work` | The site may be broken. Read the log, fix it on GitHub and deploy again, or go back ([5.5](#55-going-back-to-an-earlier-version)) |
| Deploy: `Another deploy is running` | Wait for it. `ls -t /var/log/spectrum-deploy/` shows the running log |
| GitHub Deploy run: timeout at "Deploy over SSH" | GitHub cannot reach port 22. The AWS admin must open it to `0.0.0.0/0` |
| A form says "we couldn't send this" | Run `sudo spm2 logs spectrum --lines 50 --nostream`. `not_configured` names the missing setting; `send_failed` shows the mail server's error. Then run `sudo /usr/local/bin/spectrum-smtp-check` |
| Big applications fail, small ones work | briskfern refuses messages over 10 MB (see [Open items](#13-open-items)) |
| Forms answer **403** | The same-origin check. nginx must pass `Host` and `X-Forwarded-Host` (section 9.13). The log shows `*.forbidden_origin` |
| App crash-loops after a reboot during a deploy | The build was cut short. Run `sudo /usr/local/bin/spectrum-deploy --no-pull` |
| Certificate warning in the browser | `sudo certbot certificates`, then `sudo certbot renew --dry-run`. `https://www…` warns until `www` is in the certificate |
| Site gone after an AWS stop/start | The public IP changed (no Elastic IP). Update `A @` and `A www` in GoDaddy |
| PuTTY can't connect | Your own IP probably changed. The AWS admin checks the port-22 rule in the security group |
| GoDaddy: "Record could not be added" | Turn off Website Security → Firewall, then save again |
| `www` sometimes shows "Coming Soon" | The old `A www 160.153.0.165` record is still there. Delete it |
| Disk full | Check with `df -h /`. Clean up with `sudo journalctl --vacuum-time=30d`, and remove the leftover folders in section 4 |

## 13. Open items

As of 2026-11-23:

1. **For the repo admin (Nishit):**
   - **Protect `main`:** Settings → Branches → add a ruleset for `main`. Require a pull request and the `Lint, type-check, tests, build` check, and block direct pushes.
   - **Production environment:** create an environment `production` restricted to `main`, and move the three `DEPLOY_*` secrets into it. Then add `environment: production` to the job in `deploy.yml`.
2. **First automatic deploy.** The Deploy workflow starts working with the release that brings it to `main`. Watch that first run; it also shows whether GitHub can reach port 22.
3. **`www`.**
   - Delete the old `A www 160.153.0.165` record in GoDaddy and wait 10–15 minutes.
   - Then add `www` to the certificate. When certbot asks, answer `U` (Update):

     ```bash
     sudo certbot certonly --nginx --cert-name spectrumbusinessloans.com -d spectrumbusinessloans.com -d www.spectrumbusinessloans.com
     sudo systemctl reload nginx
     sudo certbot renew --dry-run
     ```

   - nginx needs no change: the HTTPS block already redirects every other host name to `https://spectrumbusinessloans.com`.
4. **Mail size.** briskfern caps a message at 10 MB, but Apply Now accepts 15 MB of statements, which become about 21 MB as email. Large applications therefore fail. Two options:
   - set the upload limit to 6 MB (section 6);
   - move to an SMTP provider with a larger cap, e.g. Amazon SES at 40 MB. That needs the AWS admin.
5. **Recipient.** At go-live, `MAIL_TO` must be `david@spectrumbusinessfinance.com`. Check the current value in the settings file.
6. **Elastic IP.** The AWS admin must confirm or attach one. If a new IP is attached, update both A records in GoDaddy.
7. **Pushing from the server.** Two options:
   - a write **deploy key** for the repo (added by the admin);
   - a fine-grained personal token for this repo only, kept in `ubuntu`'s git credentials.
8. **SMTP password.** Rotate it, then update the settings file and restart the app.
9. **Chat widget on Apply Now.** Commit 659be8a went straight to `main` and added the GoHighLevel chat script to every page, including the page where people enter their SSN. A third-party script can read that page. Decide whether to keep it there.
10. **Cleanup.** Delete the leftovers listed in section 4 once the new layout has run for a few days.
11. **No monitoring.** No uptime alert exists. Consider a free uptime monitor.
12. **Subdomain.** `loan-calculator.spectrumbusinessloans.com` still forwards to the old site's calculator, while the site now has its own `/loan-calculator`. Whether to change it is the client's call.
13. **`npm warn EBADENGINE unpdf`.** This warning is harmless. `unpdf` is a test-only tool that prefers Node 24; the site runs on Node 22.

## 14. History

| Date | Change |
|---|---|
| 2026-11-17 | Server set up with systemd and a releases folder. Site live from `develop` (960c991). DNS `@` pointed at the server. Let's Encrypt certificate for the bare domain |
| 2026-11-18 | SMTP configured (briskfern, port 465). Release PR #3 merged into `main` (e8c42ad), and the server switched to `main` |
| 2026-11-21 | Loan calculator and themed application PDF released (PR #4, PR #5 → `main` 36b96fe) |
| 2026-11-22 | 36b96fe deployed. Every image returned 404, because the old deploy script nested `public/`. Fixed by hand. 659be8a (chat widget) was pushed straight to `main` |
| 2026-11-23 | Moved from systemd to **PM2**. Layout changed to **one git folder**, `/var/www/spectrum`, at the owner's choice. New deploy script, reviewed and break-tested. **GitHub Actions deploy** added (`deploy.yml`, deploy user, repository secrets) |
