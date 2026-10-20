(() => {
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const EMAIL = 'ankitgahlot958@gmail.com', PHONE = '+91-8700307602';
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ================= DATA (from the resume) ================= */
const PROJECTS = [
  { kind:'LINUX', name:'Linux Infrastructure Automation & Hardening', slug:'linux-infra-automation-hardening', sub:'RHEL · CentOS · Ubuntu', tools:['Bash','cron','firewalld','SSH','LVM','ACL'],
    points:[
      'Set up and managed virtual user accounts in a Linux lab: user provisioning, group management and ACL configuration.',
      'Wrote a cron-driven Bash script that takes incremental backups and sends email alerts, to learn how automated backup pipelines work in practice.',
      'Practiced SSH hardening and firewalld rule configuration on a test VM to learn basic Linux security habits.',
      'Simulated a storage expansion on a virtual machine to learn LVM volume extension and filesystem migration.'] },
  { kind:'K8S', name:'Kubernetes Microservices Deployment', slug:'k8s-microservices-deployment', sub:'kubeadm · Ingress · StatefulSet', tools:['kubeadm','Deployments','Services','Ingress','RBAC','StatefulSet','PV/PVC'],
    points:[
      'Set up a multi-node Kubernetes cluster with kubeadm and deployed a sample 3-tier microservices app using Deployments, Services and Ingress.',
      'Configured RBAC policies and Namespace isolation to understand access control in a multi-tenant style setup.',
      'Deployed a MySQL StatefulSet backed by PersistentVolumes and PVCs to see how stateful workloads keep data across Pod restarts.',
      'Practiced rolling updates and rollbacks to learn how Kubernetes handles deployment changes.'] },
  { kind:'DOCKER', name:'Containerized Application Deployment on Linux', slug:'containerized-app-on-linux', sub:'Docker · Ubuntu host', tools:['Docker','Dockerfile','bridge / host networking','volumes','Bash','cron'],
    points:[
      'Deployed Docker containers on an Ubuntu host and tried bridge and host networking modes for multi-container setups.',
      'Wrote Dockerfiles to containerize a sample web application and managed images and containers through the Docker CLI.',
      'Wrote Bash scripts and cron jobs to automate container startup and cleanup on the host.',
      'Used Docker volume mounts to persist container data and understand storage across the container and OS layers.'] },
  { kind:'AWS', name:'AWS Cloud Infrastructure & Automation', slug:'aws-cloud-infra-automation', sub:'EC2 · VPC · S3 · IAM · EKS', tools:['EC2','VPC','S3','IAM','EKS','CloudWatch','Bash'],
    points:[
      'Provisioned EC2 instances with custom VPCs, subnets and Security Groups to practice a basic multi-tier network on AWS.',
      'Automated S3 backup uploads with Bash scripts and IAM roles, to learn least-privilege access for cloud storage.',
      'Deployed a sample containerized app on EKS and explored node groups, kubectl access via kubeconfig and CloudWatch logs.',
      'Set up IAM users, groups and policies across EC2, S3 and EKS to learn AWS access control fundamentals.'] }
];

const STACK = [
  ['Linux / OS','Installation, hardening, LVM and filesystem management.',['RHEL','CentOS','Ubuntu','LVM','Hardening']],
  ['Containers','Image building, multi-stage builds and container networking.',['Docker','containerd','Dockerfile','Multi-stage builds']],
  ['Orchestration','Kubernetes with kubeadm and Minikube.',['Pods','Deployments','DaemonSets','RBAC','Ingress','ConfigMaps','Secrets','Rolling Updates','Rollbacks']],
  ['Cloud (AWS)','Instance management, storage and access control.',['EC2','S3','IAM','VPC','Security Groups','EKS','CloudWatch']],
  ['Automation','Scripting and scheduled jobs.',['Bash','cron','Backup & restore pipelines']],
  ['Networking','From addressing to firewalls and file sharing.',['TCP/IP','DNS','DHCP','SSH','iptables','firewalld','NFS','Samba']],
  ['Storage','Persistent data for stateful workloads.',['PersistentVolumes','PVCs','StorageClasses','LVM expansion']],
  ['Monitoring & tooling','Logs, metrics and the daily toolkit.',['kubectl logs/events','Prometheus','Grafana','OS patching & alerting','Git','YAML']]
];

const LAYERS = [
  { name:'Linux & Storage', desc:'Install, harden and grow Linux hosts.', tools:['RHEL','CentOS','Ubuntu','LVM','LVM expansion','Hardening','ACL'], inc:[0] },
  { name:'Networking', desc:'From addressing to firewalls and file sharing.', tools:['TCP/IP','DNS','DHCP','SSH','iptables','firewalld','NFS','Samba'], inc:[0,2] },
  { name:'Containers', desc:'Image building, multi-stage builds and container networking.', tools:['Docker','containerd','Dockerfile','Multi-stage builds','Volumes'], inc:[2] },
  { name:'Orchestration', desc:'Kubernetes with kubeadm and Minikube, including stateful workloads.', tools:['Pods','Deployments','DaemonSets','StatefulSets','RBAC','Ingress','ConfigMaps','Secrets','Rolling Updates','Rollbacks','PersistentVolumes','PVCs','StorageClasses'], inc:[1,3] },
  { name:'Cloud (AWS)', desc:'Instance management, storage and access control.', tools:['EC2','S3','IAM','VPC','Security Groups','EKS','CloudWatch'], inc:[3] },
  { name:'Automation & Monitoring', desc:'Scripting, scheduled jobs and keeping an eye on things.', tools:['Bash','cron','Backup & restore pipelines','kubectl logs/events','Prometheus','Grafana','OS patching & alerting','Git','YAML'], inc:[0,1] }
];

const o = (c, ok, out, note, harm) => ({ c, ok:!!ok, out:out||[], note:note||'', harm:!!harm });
const INCIDENTS = [
  { id:'INC-001', sev:'SEV-2', svc:'app-01 · /var', kind:'Linux', short:'Disk full on /var', title:'Disk at 97% on /var, app writes are failing',
    lesson:'LVM grows a volume online while it stays mounted.',
    intro:['[alert] app-01: /var at 97% (threshold 90%)','[alert] app.service: write failed, No space left on device','[pager] You are on call. Incident acknowledged.'],
    steps:[
      { ask:'Find out which filesystem is full.', opts:[
        o('df -h', 1, ['Filesystem            Size  Used Avail Use% Mounted on','/dev/mapper/vg0-root   20G  7.1G   13G  36% /','/dev/mapper/vg0-var    20G   19G  600M  97% /var','/dev/sda1            512M  110M  402M  22% /boot']),
        o('rm -rf /var/*', 0, ["removed '/var/lib/app/data.db'","removed '/var/log/app/'",'[alert] app.service: crashed, data directory missing'], 'That deleted live data. Diagnose before you delete.', 1),
        o('reboot', 0, ['Connection to app-01 closed by remote host.','app-01 is back up. /var is still at 97%.'], 'A reboot does not free disk space.', 1),
        o('ls /home', 0, ['ankit  deploy'], 'No damage, but /home is not what is failing. Try another command.', 0) ] },
      { ask:'/var is the problem. Check whether the volume group has room to grow.', opts:[
        o('vgs', 1, ['  VG   #PV #LV #SN Attr   VSize  VFree','  vg0    2   3   0 wz--n- 60.00g 20.00g']),
        o('mkfs.ext4 /dev/vg0/var', 0, ['mke2fs 1.46.5','Proceed anyway? (y,N) y','Creating filesystem with 5242880 4k blocks... done','[alert] /var is now empty. The app data is gone.'], 'That formats the volume and wipes it.', 1),
        o('systemctl stop app', 0, ['app.service stopped.','[alert] Customers are now fully down. /var is still 97% full.'], 'Stopping the app hides the symptom and causes the outage.', 1),
        o('fdisk -l | grep sda', 0, ['Disk /dev/sda: 40 GiB, 42949672960 bytes'], 'No damage, but that shows raw disks, not free LVM space.', 0) ] },
      { ask:'VFree is 20G. Grow /var by 10G while it stays mounted.', opts:[
        o('lvextend -r -L +10G /dev/vg0/var', 1, ['  Size of logical volume vg0/var changed from 20.00 GiB to 30.00 GiB.','  Logical volume vg0/var successfully resized.','resize2fs 1.46.5','The filesystem on /dev/mapper/vg0-var is now 7864320 blocks long.']),
        o('lvreduce -L -10G /dev/vg0/var', 0, ['  WARNING: Reducing active logical volume to 10.00 GiB.','  THIS MAY DESTROY YOUR DATA (filesystem etc.)'], 'Wrong direction. You reduce a volume that is already full.', 1),
        o('pvremove /dev/sdb1', 0, ['  PV /dev/sdb1 is used by VG vg0 so please use vgreduce first.'], 'You tried to remove storage when you needed to add it.', 0),
        o('mount -o remount,rw /var', 0, ['mount: /var is already mounted read-write.'], 'The mount is fine. It just needs more space.', 0) ] }
    ],
    resolved:['[ok] /var is now at 63% (19G of 30G)','[ok] app.service healthy. Alert cleared.'] },

  { id:'INC-002', sev:'SEV-1', svc:'k8s · namespace shop', kind:'Kubernetes', short:'payments-api crash loop', title:'payments-api is in CrashLoopBackOff after a deploy',
    lesson:'Deployments keep revision history, so a rollback is one command.',
    intro:['[alert] shop/payments-api: pods restarting, 0 of 2 ready','[alert] Checkout error rate 41%','[pager] You are on call. Incident acknowledged.'],
    steps:[
      { ask:'See what the pods are doing.', opts:[
        o('kubectl get pods -n shop', 1, ['NAME                            READY   STATUS             RESTARTS   AGE','payments-api-6f8d9c7b54-x2k9q   0/1     CrashLoopBackOff   6          9m','payments-api-6f8d9c7b54-m4tzw   0/1     CrashLoopBackOff   6          9m','mysql-0                         1/1     Running            0          3d']),
        o('kubectl delete pod --all -n kube-system', 0, ['pod "coredns-5d78c9869d-8hq2z" deleted','pod "kube-proxy-w7nfg" deleted','[alert] Cluster DNS is down. Every service is affected.'], 'That is the cluster\'s own namespace. Never fire blind.', 1),
        o('kubectl scale deploy/payments-api --replicas=0 -n shop', 0, ['deployment.apps/payments-api scaled','[alert] Checkout error rate 100%. No payments pods exist.'], 'Now the outage is complete, not fixed.', 1),
        o('kubectl get nodes', 0, ['NAME            STATUS   ROLES           AGE   VERSION','control-plane   Ready    control-plane   41d   v1.29.2','worker-1        Ready    <none>          41d   v1.29.2','worker-2        Ready    <none>          41d   v1.29.2'], 'No damage. The nodes are healthy, so the problem is in the app pods.', 0) ] },
      { ask:'Two pods keep crashing. Read why the container keeps dying.', opts:[
        o('kubectl logs payments-api-6f8d9c7b54-x2k9q -n shop --previous', 1, ['FATAL: config key DB_HOST not found in configmap "payments-config"','exit status 1']),
        o('kubectl exec -it payments-api-6f8d9c7b54-x2k9q -n shop -- sh', 0, ['error: unable to upgrade connection: container not found ("payments-api")'], 'You cannot exec into a container that keeps crashing. Read its last logs instead.', 0),
        o('kubectl describe node worker-1', 0, ['Capacity:  cpu: 4  memory: 8Gi','Allocated resources: cpu 38%  memory 41%'], 'No damage. Node details will not show an app startup error.', 0),
        o('kubectl delete configmap payments-config -n shop', 0, ['configmap "payments-config" deleted','[alert] mysql-0 and two other workloads lost their config.'], 'You removed config other workloads were using.', 1) ] },
      { ask:'The new revision references a config key that does not exist. Get back to the last good version.', opts:[
        o('kubectl rollout undo deploy/payments-api -n shop', 1, ['deployment.apps/payments-api rolled back']),
        o('kubectl delete deploy payments-api -n shop', 0, ['deployment.apps "payments-api" deleted','[alert] No payments pods exist. You now have to rebuild from YAML.'], 'You deleted the revision history you needed.', 1),
        o('kubectl rollout restart deploy/payments-api -n shop', 0, ['deployment.apps/payments-api restarted','payments-api-86d5c7f6b9-q7w2d   0/1   CrashLoopBackOff'], 'Same bad config, same crash. Restarting is not a fix.', 0),
        o('kubectl taint nodes worker-1 maintenance=true:NoExecute', 0, ['node/worker-1 tainted','[alert] Pods evicted from worker-1. Capacity halved.'], 'Evicting pods from a node does not fix a bad config.', 1) ] }
    ],
    resolved:['payments-api-5c7d8b6f99-2hkd8   1/1   Running','payments-api-5c7d8b6f99-x9pv4   1/1   Running','[ok] Checkout error rate back to 0.2%. Alert cleared.'] },

  { id:'INC-003', sev:'SEV-3', svc:'docker · ubuntu host', kind:'Docker', short:'web cannot reach db', title:'The web container cannot reach the database',
    lesson:'Containers resolve each other by name only on a shared user-defined network.',
    intro:['[alert] web: health check failing, /health returns 500','[alert] web logs: Unknown host: db','[pager] You are on call. Incident acknowledged.'],
    steps:[
      { ask:'List the running containers.', opts:[
        o('docker ps', 1, ['CONTAINER ID  IMAGE        STATUS        PORTS                 NAMES','a1c4e90f2b11  webapp:1.3   Up 12 min     0.0.0.0:8080->80/tcp  web','7d03b5c8e6a2  mysql:8.0    Up 12 min     3306/tcp              db']),
        o('docker system prune -af', 0, ['Deleted Images: webapp:1.2, nginx:1.25, redis:7','Total reclaimed space: 1.4GB','[alert] Rollback images are gone.'], 'That wipes unused images, including ones you may need. It is not a diagnosis.', 1),
        o('docker rm -f db', 0, ['db','[alert] The database container no longer exists.'], 'You just deleted the database container.', 1),
        o('docker images', 0, ['webapp   1.3   2 days ago   182MB','mysql    8.0   3 weeks ago  577MB'], 'No damage. Both containers are already running, so images are not the issue.', 0) ] },
      { ask:'Both are up, but web says "Unknown host: db". Check which network db is on.', opts:[
        o('docker network inspect app-net', 1, ['"Name": "app-net",','"Containers": { "db": { "IPv4Address": "172.20.0.2/16" } }','# web is not listed. It is on the default bridge network.']),
        o('docker restart web', 0, ['web','web logs: Unknown host: db'], 'Restarting does not change which network the container sits on.', 0),
        o('ufw disable', 0, ['Firewall stopped and disabled on system startup','[alert] Host firewall is off.'], 'The firewall is not the cause, and turning it off is unsafe.', 1),
        o('docker run --network host webapp:1.3', 0, ['docker: Error response from daemon: port is already allocated.'], 'Host networking skips the real fix and fights the port mapping.', 0) ] },
      { ask:'db is on app-net and web is not. Connect web to it without downtime.', opts:[
        o('docker network connect app-net web', 1, []),
        o('docker network rm app-net', 0, ['Error response from daemon: error while removing network: network app-net has active endpoints'], 'That would remove the network the database is on.', 0),
        o('docker volume prune -f', 0, ['Deleted Volumes: mysql_data','Total reclaimed space: 812MB','[alert] Database files deleted.'], 'That deletes unused volumes, and your data volume went with it.', 1),
        o('docker stop db && docker start db', 0, ['db','web logs: Unknown host: db'], 'Restarting the database does not put web on its network.', 0) ] }
    ],
    resolved:['$ curl -s localhost:8080/health','{"status":"ok","db":"connected"}','[ok] web now resolves db by name. Alert cleared.'] },

  { id:'INC-004', sev:'SEV-2', svc:'aws · EC2 backup-role', kind:'AWS', short:'S3 backup AccessDenied', title:'The nightly S3 backup fails with AccessDenied',
    lesson:'IAM roles carry narrow, specific access, so no keys sit on the server.',
    intro:['[alert] backup-job-failed: 3 consecutive failures','[alert] Last good backup: 3 days ago','[pager] You are on call. Incident acknowledged.'],
    steps:[
      { ask:'Reproduce the failure and read the error.', opts:[
        o('aws s3 cp backup.tar.gz s3://acme-backups/', 1, ['upload failed: ./backup.tar.gz to s3://acme-backups/backup.tar.gz','An error occurred (AccessDenied) when calling the PutObject operation:','User: arn:aws:sts::111122223333:assumed-role/backup-role/i-0a1b2c is not authorized to perform: s3:PutObject']),
        o('aws ec2 terminate-instances --instance-ids i-0a1b2c', 0, ['"CurrentState": { "Name": "shutting-down" }','[alert] The backup host is gone.'], 'The error is about permissions. Do not kill the instance.', 1),
        o('aws s3 rb s3://acme-backups --force', 0, ['remove_bucket: acme-backups','[alert] The backup bucket and all backups are deleted.'], 'You deleted the backup bucket.', 1),
        o('aws cloudwatch describe-alarms', 0, ['"AlarmName": "backup-job-failed", "StateValue": "ALARM"'], 'No damage. That confirms the alarm but not the cause.', 0) ] },
      { ask:'The role is not allowed to write. Check what it is allowed to do.', opts:[
        o('aws iam list-attached-role-policies --role-name backup-role', 1, ['{ "AttachedPolicies": [ { "PolicyName": "AmazonEC2ReadOnlyAccess" } ] }','# No S3 permissions are attached.']),
        o('aws iam create-access-key --user-name admin', 0, ['"AccessKeyId": "AKIA...", "SecretAccessKey": "..."','[alert] Admin keys created for a server. Security review opened.'], 'Putting admin keys on a server is worse than fixing the role.', 1),
        o('aws ec2 describe-instances', 0, ['"InstanceId": "i-0a1b2c", "State": "running"'], 'No damage. The instance is healthy. The role is missing permissions.', 0),
        o('aws s3api put-bucket-acl --bucket acme-backups --acl public-read-write', 0, ['[alert] acme-backups is now world-writable. Security alert raised.'], 'Never fix permissions by opening a bucket to the internet.', 1) ] },
      { ask:'Grant only what the job needs: write access to that one bucket.', opts:[
        o('aws iam put-role-policy --role-name backup-role --policy-name s3-backup-write --policy-document file://backup-bucket-only.json', 1, []),
        o('aws iam attach-role-policy --role-name backup-role --policy-arn arn:aws:iam::aws:policy/AdministratorAccess', 0, ['[alert] backup-role can now do anything in the account.'], 'It works, and it is the classic mistake. Least privilege means one bucket only.', 1),
        o('aws iam attach-role-policy --role-name backup-role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess', 0, ['[alert] backup-role can now read and delete every bucket in the account.'], 'Better than admin, but still far too broad for one backup bucket.', 1),
        o('aws iam delete-role --role-name backup-role', 0, ['An error occurred (DeleteConflict): Cannot delete entity, must detach all policies first.'], 'Deleting the role would break the instance profile. Try a narrower fix.', 0) ] }
    ],
    resolved:['[ok] Policy scoped to arn:aws:s3:::acme-backups/*','$ aws s3 cp backup.tar.gz s3://acme-backups/','upload: ./backup.tar.gz to s3://acme-backups/backup.tar.gz','[ok] Backup job green. Alert cleared.'] }
];

/* ================= helpers ================= */
const cls = t => t.startsWith('[ok]') ? 'ok' : t.startsWith('[alert]') ? 'bad' : t.startsWith('[pager]') ? 'warn' : t.startsWith('[review]') ? 'warn' : t.startsWith('#') ? 'cm' : t.startsWith('$ ') ? 'cmd2' : 'out';
const fmt = s => { s = Math.floor(s); return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0'); };
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
function goto(id){ const el = $(id); if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block:'start' }); }
let toastT;
function toast(msg){ const t=$('toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{ t.hidden=true; },1800); }
function copyText(txt, msg){
  const fb = () => { toast('Select and copy: ' + txt); };
  try { navigator.clipboard.writeText(txt).then(()=>toast(msg||'Copied'), fb); } catch(e){ fb(); }
}
document.addEventListener('click', e => { const a = e.target.closest('[data-go]'); if (a){ e.preventDefault(); goto(a.dataset.go); } });
document.addEventListener('pointermove', e => {
  const t = e.target.closest && e.target.closest('.ldetail'); if (!t) return;
  const r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX-r.left)+'px'); t.style.setProperty('--my', (e.clientY-r.top)+'px');
});

/* ================= theme + shared canvas colours ================= */
const C = {};
function readColors(){ const s = getComputedStyle(root); ['--accent','--ok','--i3','--i4','--line','--line-2','--panel-solid','--panel-2','--fg','--mut'].forEach(k => { C[k] = s.getPropertyValue(k).trim() || '#7CE0FF'; }); }
readColors();
let topoRedraw = () => {};
let meshRedraw = () => {};
const redrawStatic = () => { readColors(); if (reduced){ meshRedraw(); topoRedraw(); } };
const mqLight = matchMedia('(prefers-color-scheme: light)');
const effective = () => root.getAttribute('data-theme') || (mqLight.matches ? 'light' : 'dark');
try { const s = localStorage.getItem('as-theme'); if (s==='light'||s==='dark') root.setAttribute('data-theme', s); } catch(e){}
function toggleTheme(){
  const n = effective()==='dark' ? 'light' : 'dark'; root.setAttribute('data-theme', n);
  try { localStorage.setItem('as-theme', n); } catch(e){}
  redrawStatic();
}
$('theme').addEventListener('click', toggleTheme);
mqLight.addEventListener && mqLight.addEventListener('change', redrawStatic);
readColors();

/* ================= progress bar + clock ================= */
const prog = $('prog');
function onScroll(){ const h = document.documentElement.scrollHeight - innerHeight; prog.style.transform = 'scaleX(' + (h>0 ? Math.min(1, scrollY/h) : 0) + ')'; }
addEventListener('scroll', onScroll, { passive:true }); onScroll();
try {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
  const tick = () => { $('clock').textContent = 'Faridabad, ' + f.format(new Date()) + ' IST'; };
  tick(); setInterval(tick, 1000);
} catch(e){ $('clock').textContent = 'Faridabad, IST'; }

/* ================= hero: name effects ================= */
const N1 = $('n1'), N2 = $('n2'), FIN = ['Ankit','Saini'];
const GL = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789#%&';
let decoding = false;
function setName(a,b){ N1.textContent = a; N2.textContent = b; }
function decode(){
  if (reduced || decoding) return; decoding = true;
  const t0 = performance.now(), D = 800;
  (function step(now){
    const p = Math.min(1, (now - t0) / D);
    const mk = (s, off) => s.split('').map((ch,i) => p > ((i + off) / 10) * .75 + .2 ? ch : GL[(Math.random()*GL.length)|0]).join('');
    if (p < 1){ setName(mk(FIN[0],0), mk(FIN[1],5)); requestAnimationFrame(step); }
    else { setName(FIN[0], FIN[1]); decoding = false; }
  })(t0);
}
setName(FIN[0], FIN[1]);
$('name').addEventListener('pointerenter', decode);
$('name').addEventListener('pointerdown', decode);
if (!reduced){
  setInterval(() => {
    if (decoding || document.hidden) return;
    const li = Math.random() < .5 ? 0 : 1, s = FIN[li].split(''), k = (Math.random()*s.length)|0;
    s[k] = GL[(Math.random()*GL.length)|0];
    if (li===0) N1.textContent = s.join(''); else N2.textContent = s.join('');
    setTimeout(() => { if (!decoding) setName(FIN[0], FIN[1]); }, 130);
  }, 4200);
}

/* ================= hero: live network mesh ================= */
{
  const hero = $('top'), mesh = $('mesh'), mctx = mesh.getContext('2d');
  let MW = 0, MH = 0, pts = [], pulses = [], mLast = performance.now(), meshVis = true, meshRunning = false;
  const ptr = { x:-999, y:-999, on:false };
  function meshSize(){
    const r = hero.getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    MW = r.width; MH = r.height; mesh.width = Math.round(MW*dpr); mesh.height = Math.round(MH*dpr); mctx.setTransform(dpr,0,0,dpr,0,0);
    const n = Math.max(34, Math.min(105, Math.round(MW*MH/11000)));
    pts = Array.from({length:n}, () => ({ x:Math.random()*MW, y:Math.random()*MH, vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28, r:1+Math.random()*1.3, k:Math.random()<.1, g:0 }));
  }
  function meshFrame(now){
    const dt = Math.min((now - mLast)/16.7, 3); mLast = now;
    if (!MW){ meshSize(); if (!MW) return; }
    mctx.clearRect(0,0,MW,MH);
    for (const p of pts){
      if (!reduced){
        p.x += p.vx*dt; p.y += p.vy*dt;
        if (p.x < -10) p.x = MW+10; else if (p.x > MW+10) p.x = -10;
        if (p.y < -10) p.y = MH+10; else if (p.y > MH+10) p.y = -10;
        if (ptr.on){ const dx=p.x-ptr.x, dy=p.y-ptr.y, d2=dx*dx+dy*dy; if (d2 < 14400 && d2 > 1){ const d=Math.sqrt(d2), f=(1-d/120)*1.1; p.x += dx/d*f*dt; p.y += dy/d*f*dt; } }
      }
      p.g *= .93;
    }
    mctx.lineWidth = 1; mctx.strokeStyle = C['--accent'];
    const L = 130;
    for (let i=0;i<pts.length;i++){ const a = pts[i];
      for (let j=i+1;j<pts.length;j++){ const b = pts[j], dx=a.x-b.x, dy=a.y-b.y, d2=dx*dx+dy*dy;
        if (d2 < L*L){ const d = Math.sqrt(d2); mctx.globalAlpha = Math.min(.85, (1-d/L)*.22*(1 + (a.g+b.g)*2)); mctx.beginPath(); mctx.moveTo(a.x,a.y); mctx.lineTo(b.x,b.y); mctx.stroke(); } } }
    if (ptr.on){ mctx.strokeStyle = C['--i3'];
      for (const p of pts){ const dx=p.x-ptr.x, dy=p.y-ptr.y, d2=dx*dx+dy*dy; if (d2 < 24000){ const d=Math.sqrt(d2); mctx.globalAlpha=(1-d/155)*.6; mctx.beginPath(); mctx.moveTo(p.x,p.y); mctx.lineTo(ptr.x,ptr.y); mctx.stroke(); } } }
    for (let i=pulses.length-1;i>=0;i--){ const q = pulses[i]; q.r += 4.4*dt;
      if (q.r > 460){ pulses.splice(i,1); continue; }
      mctx.globalAlpha = (1 - q.r/460)*.55; mctx.strokeStyle = C['--i4']; mctx.lineWidth = 1.5; mctx.beginPath(); mctx.arc(q.x,q.y,q.r,0,Math.PI*2); mctx.stroke();
      for (const p of pts){ const d = Math.hypot(p.x-q.x, p.y-q.y); if (Math.abs(d - q.r) < 16) p.g = 1; } }
    for (const p of pts){
      if (p.k){ mctx.globalAlpha = .5 + p.g*.45; mctx.strokeStyle = C['--ok']; mctx.lineWidth = 1.3; mctx.strokeRect(p.x-4, p.y-4, 8, 8); }
      else { mctx.globalAlpha = .45 + p.g*.5; mctx.fillStyle = p.g > .3 ? C['--i4'] : C['--accent']; mctx.beginPath(); mctx.arc(p.x,p.y,p.r + p.g*2,0,Math.PI*2); mctx.fill(); }
    }
    mctx.globalAlpha = 1;
  }
  meshRedraw = () => meshFrame(performance.now());
  function meshLoop(now){ if (!meshVis){ meshRunning = false; return; } meshFrame(now); requestAnimationFrame(meshLoop); }
  function meshStart(){ if (reduced || meshRunning) return; meshRunning = true; mLast = performance.now(); requestAnimationFrame(meshLoop); }
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; });
  hero.addEventListener('pointerleave', () => { ptr.on = false; });
  hero.addEventListener('pointerdown', e => { const r = hero.getBoundingClientRect(); pulses.push({ x:e.clientX - r.left, y:e.clientY - r.top, r:0 }); if (pulses.length > 6) pulses.shift(); });
  if (window.ResizeObserver) new ResizeObserver(() => { meshSize(); if (reduced) meshFrame(performance.now()); }).observe(hero); else addEventListener('resize', meshSize);
  if (window.IntersectionObserver) new IntersectionObserver(es => { meshVis = es[0].isIntersecting; if (meshVis) meshStart(); }).observe(hero);
  meshSize(); meshFrame(performance.now()); meshStart();
}

/* ================= hero: cluster lab map ================= */
{
  const cv = $('topo'), ctx = cv.getContext('2d'), cap = $('topo-cap');
  let W = 0, H = 0, nodes = [], edges = [], packets = [], hover = -1, last = performance.now(), vis = true, running = false;
  const INFO = {
    ingress:['ingress','Entry point. Routes outside traffic to the right Service.'],
    cp:['control-plane','API server, etcd and scheduler. Decides what runs where.'],
    w1:['worker-1','kubelet and containerd running Pods.'],
    w2:['worker-2','kubelet and containerd running Pods.'],
    w3:['worker-3','kubelet and containerd running Pods.'],
    w4:['worker-4','kubelet and containerd running Pods.']
  };
  function layout(){
    const r = cv.getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const bw = Math.min(W*0.26, 120), bh = Math.min(H*0.17, 64);
    nodes = [
      {id:'ingress', x:W*.5, y:H*.09, w:Math.min(W*.2,92), h:Math.min(H*.09,34), t:'ing'},
      {id:'cp', x:W*.5, y:H*.54, r:Math.min(W,H)*.1, t:'cp'},
      {id:'w1', x:W*.2, y:H*.33, w:bw, h:bh, t:'w'},
      {id:'w2', x:W*.8, y:H*.33, w:bw, h:bh, t:'w'},
      {id:'w3', x:W*.2, y:H*.80, w:bw, h:bh, t:'w'},
      {id:'w4', x:W*.8, y:H*.80, w:bw, h:bh, t:'w'}
    ];
    edges = [[0,2],[0,3],[1,2],[1,3],[1,4],[1,5]];
    if (!packets.length) edges.forEach((e,i) => { for (let k=0;k<2;k++) packets.push({ e:i, t:Math.random(), s:.12+Math.random()*.16, dir:Math.random()<.5?1:-1 }); });
  }
  function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  function frame(now){
    const dt = Math.min((now-last)/1000, .05); last = now;
    if (!W){ layout(); if (!W) return; }
    ctx.clearRect(0,0,W,H);
    const cx = nodes[1].x, cy = nodes[1].y;
    ctx.save(); ctx.strokeStyle = C['--line']; ctx.setLineDash([2,7]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy, W*.34, H*.3, 0, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    edges.forEach((e) => {
      const a = nodes[e[0]], b = nodes[e[1]], hot = hover===e[0] || hover===e[1];
      ctx.strokeStyle = hot ? C['--accent'] : C['--line-2']; ctx.lineWidth = hot ? 1.6 : 1;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    });
    packets.forEach(p => {
      if (!reduced){ p.t += p.s*dt*p.dir; if (p.t>1){p.t=1;p.dir=-1;} if (p.t<0){p.t=0;p.dir=1;} }
      const e = edges[p.e], a = nodes[e[0]], b = nodes[e[1]];
      const x = a.x+(b.x-a.x)*p.t, y = a.y+(b.y-a.y)*p.t;
      ctx.fillStyle = C['--accent']; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(x,y,2.6,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill(); ctx.globalAlpha = 1;
    });
    const tm = now/1000;
    nodes.forEach((n,i) => {
      const hot = hover===i;
      ctx.font = '500 10px JetBrains Mono, ui-monospace, monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      if (n.t==='cp'){
        ctx.fillStyle = C['--panel-solid']; ctx.strokeStyle = C['--accent']; ctx.lineWidth = hot?2.4:1.6;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill(); ctx.stroke();
        const rot = reduced ? 0 : tm*.25;
        ctx.strokeStyle = C['--accent']; ctx.lineWidth = 1.3; ctx.beginPath();
        for (let k=0;k<7;k++){ const ang = rot + k*(Math.PI*2/7) - Math.PI/2, px = n.x+Math.cos(ang)*n.r*.62, py = n.y+Math.sin(ang)*n.r*.62; if (k===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
        ctx.closePath(); ctx.stroke();
        for (let k=0;k<7;k++){ const a2 = rot + k*(Math.PI*2/7) - Math.PI/2; ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(n.x+Math.cos(a2)*n.r*.62, n.y+Math.sin(a2)*n.r*.62); ctx.stroke(); }
        ctx.fillStyle = C['--mut']; ctx.fillText('control-plane', n.x, n.y+n.r+13);
      } else if (n.t==='ing'){
        ctx.fillStyle = C['--panel-2']; ctx.strokeStyle = hot ? C['--accent'] : C['--line-2']; ctx.lineWidth = 1.3;
        rr(n.x-n.w/2, n.y-n.h/2, n.w, n.h, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C['--fg']; ctx.fillText('ingress', n.x, n.y+.5);
      } else {
        ctx.fillStyle = C['--panel-solid']; ctx.strokeStyle = hot ? C['--accent'] : C['--line-2']; ctx.lineWidth = hot?2:1.3;
        rr(n.x-n.w/2, n.y-n.h/2, n.w, n.h, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C['--mut']; ctx.fillText('worker-'+n.id.slice(1), n.x, n.y-n.h/2-9);
        const ps = Math.min(n.w*.17, 14), gp = ps*.7, total = ps*3+gp*2, sx = n.x-total/2;
        for (let q=0;q<3;q++){
          ctx.globalAlpha = reduced ? .9 : .55+.45*Math.sin(tm*1.6 + i*1.7 + q*1.1); ctx.fillStyle = C['--ok'];
          rr(sx+q*(ps+gp), n.y-ps/2, ps, ps, 2.5); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    });
  }
  topoRedraw = () => frame(performance.now());
  function loop(now){ if (!vis){ running = false; return; } frame(now); requestAnimationFrame(loop); }
  function start(){ if (reduced || running) return; running = true; last = performance.now(); requestAnimationFrame(loop); }
  function hit(px,py){
    for (let i=nodes.length-1;i>=0;i--){
      const n = nodes[i]; let ok;
      if (n.t==='cp') ok = Math.hypot(px-n.x,py-n.y) <= n.r+6;
      else ok = Math.abs(px-n.x) <= n.w/2+6 && Math.abs(py-n.y) <= n.h/2+10;
      if (ok) return i;
    }
    return -1;
  }
  function setHover(i){
    if (i===hover) return; hover = i;
    if (i<0) cap.innerHTML = '<b>Illustrative topology.</b> Hover or tap a node to see what it does.';
    else { const d = INFO[nodes[i].id]; cap.innerHTML = '<b>'+esc(d[0])+'</b> · '+esc(d[1]); }
    if (reduced) frame(performance.now());
  }
  const pt = e => { const r = cv.getBoundingClientRect(); return [e.clientX-r.left, e.clientY-r.top]; };
  cv.addEventListener('pointermove', e => { const p = pt(e); setHover(hit(p[0],p[1])); });
  cv.addEventListener('pointerdown', e => { const p = pt(e); setHover(hit(p[0],p[1])); });
  cv.addEventListener('pointerleave', () => setHover(-1));
  if (window.ResizeObserver) new ResizeObserver(() => { layout(); if (reduced) frame(performance.now()); }).observe(cv); else addEventListener('resize', layout);
  if (window.IntersectionObserver) new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) start(); }).observe(cv);
  layout(); frame(performance.now()); start();
}

/* ================= incident room ================= */
const S = { cur:0, step:0, solved:[false,false,false,false], elapsed:[0,0,0,0], mistakes:0, budget:5, busy:false, last:Date.now() };
const inclist = $('inclist'), pager = $('pager'), screen = $('screen'), choices = $('choices');
let gameVisible = false;
if (window.IntersectionObserver) new IntersectionObserver(es => { gameVisible = es[0].isIntersecting; }, { threshold:.2 }).observe($('incidents'));
const solvedCount = () => S.solved.filter(Boolean).length;

function renderList(){
  inclist.innerHTML = INCIDENTS.map((n,i) => `<button type="button" class="inc ${S.solved[i]?'done':''}" data-i="${i}" ${i===S.cur?'aria-current="true"':''}><span class="top"><span>${n.id}</span><span class="st">${S.solved[i]?'RESOLVED':'OPEN'}</span></span><span class="ti">${esc(n.short)}</span><span class="kd">${n.kind.toUpperCase()}</span></button>`).join('');
}
function renderPager(){
  const n = INCIDENTS[S.cur], done = S.solved[S.cur];
  const pips = Array.from({length:5}, (_,i) => `<i class="${i < S.budget ? '' : 'off'}"></i>`).join('');
  pager.innerHTML = `<div><div class="pg-tags"><span class="sev ${done?'ok':''}">${done?'RESOLVED':n.sev}</span><span>${n.id}</span><span>${esc(n.svc)}</span></div><h3>${esc(n.title)}</h3></div>
  <div class="pg-r"><div class="m"><small>Elapsed</small><b id="timer">${fmt(S.elapsed[S.cur])}</b></div><div class="m"><small>Error budget</small><span class="pips" role="img" aria-label="${S.budget} of 5 left">${pips}</span></div><div class="m"><small>Resolved</small><b>${solvedCount()}/4</b></div></div>`;
}
function addLine(t, c){
  const d = document.createElement('div');
  if (c === 'cmd2'){ d.className = 'ln cmd'; d.textContent = t.slice(2); } else { d.className = 'ln ' + c; d.textContent = t; }
  screen.appendChild(d); screen.scrollTop = screen.scrollHeight;
}
async function print(items, instant){
  S.busy = true; setChoicesDisabled(true);
  for (const it of items){ addLine(it.t, it.c); if (!instant && !reduced) await sleep(it.c === 'out' ? 55 : 150); }
  S.busy = false; setChoicesDisabled(false);
}
function setChoicesDisabled(v){ choices.querySelectorAll('button').forEach(b => { b.disabled = v; }); }
function showStep(first){
  const inc = INCIDENTS[S.cur], st = inc.steps[S.step];
  if (!st.order) st.order = shuffle(st.opts.map((_,i) => i));
  if (first) addLine('Step ' + (S.step+1) + ' of ' + inc.steps.length + ': ' + st.ask, 'ask');
  choices.innerHTML = st.order.map((idx,n) => `<button class="opt" type="button" data-i="${idx}"><kbd>${n+1}</kbd><code>${esc(st.opts[idx].c)}</code></button>`).join('');
  setChoicesDisabled(S.busy);
}
function showAfter(){
  const next = INCIDENTS.findIndex((_,i) => !S.solved[i]);
  let h = '';
  if (next >= 0) h += `<button class="opt wide" type="button" data-act="next" data-i="${next}"><kbd>→</kbd><code>Open ${INCIDENTS[next].id}: ${esc(INCIDENTS[next].short)}</code></button>`;
  else h += `<button class="opt wide" type="button" data-act="result"><kbd>→</kbd><code>All incidents resolved. See the result</code></button>`;
  h += `<button class="opt wide" type="button" data-act="replay"><kbd>↻</kbd><code>Replay ${INCIDENTS[S.cur].id}</code></button>`;
  choices.innerHTML = h;
}
async function openInc(i, instant){
  if (S.busy) return;
  S.cur = i; S.step = 0; INCIDENTS[i].steps.forEach(s => { delete s.order; });
  renderList(); renderPager(); screen.innerHTML = ''; choices.innerHTML = '';
  const inc = INCIDENTS[i];
  await print(inc.intro.map(t => ({ t, c:cls(t) })), instant);
  if (S.solved[i]){ addLine('[ok] ' + inc.id + ' is already resolved. Takeaway: ' + inc.lesson, 'ok'); showAfter(); }
  else showStep(true);
}
async function choose(idx){
  if (S.busy) return;
  const inc = INCIDENTS[S.cur], opt = inc.steps[S.step].opts[idx];
  const items = [{ t:'$ ' + opt.c, c:'cmd2' }].concat(opt.out.map(t => ({ t, c:cls(t) })));
  if (!opt.ok){
    items.push({ t:'[review] ' + opt.note, c: opt.harm ? 'bad' : 'warn' });
    if (opt.harm){
      S.mistakes++; S.budget--;
      if (S.budget <= 0){ S.budget = 5; items.push({ t:'[alert] Error budget exhausted. In production this pages your manager. Budget reset, keep going.', c:'bad' }); }
      renderPager();
    }
    await print(items); showStep(false); return;
  }
  await print(items);
  S.step++;
  if (S.step >= inc.steps.length) await resolve(); else showStep(true);
}
async function resolve(){
  const inc = INCIDENTS[S.cur];
  S.solved[S.cur] = true;
  const items = inc.resolved.map(t => ({ t, c:cls(t) }));
  items.push({ t:'[ok] ' + inc.id + ' resolved in ' + fmt(S.elapsed[S.cur]) + '. Takeaway: ' + inc.lesson, c:'ok' });
  await print(items);
  renderList(); renderPager(); renderProjects(); showAfter();
  if (solvedCount() === 4) showClear();
}
function showClear(){
  const total = S.elapsed.reduce((a,b) => a+b, 0);
  const rank = S.mistakes === 0 ? 'Flawless run.' : S.mistakes <= 3 ? 'Steady hands.' : 'Learns fast.';
  $('clear-t').textContent = 'Four of four resolved';
  $('clear-p').textContent = rank + ' ' + S.mistakes + ' harmful pick' + (S.mistakes===1?'':'s') + ', ' + fmt(total) + ' total on call. The labs behind these incidents are real. The outages are not.';
  $('allclear').hidden = false;
}
function resetGame(){
  S.solved = [false,false,false,false]; S.elapsed = [0,0,0,0]; S.mistakes = 0; S.budget = 5;
  $('allclear').hidden = true; renderProjects(); openInc(0, true);
}
inclist.addEventListener('click', e => { const b = e.target.closest('.inc'); if (b) openInc(+b.dataset.i); });
choices.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  const act = b.dataset.act;
  if (act === 'next') openInc(+b.dataset.i);
  else if (act === 'replay'){ INCIDENTS[S.cur].steps.forEach(s => { delete s.order; }); S.step = 0; screen.innerHTML = ''; addLine('[pager] Replaying ' + INCIDENTS[S.cur].id + '. Your stamp stays.', 'warn'); showStep(true); }
  else if (act === 'result'){ goto('allclear'); }
  else choose(+b.dataset.i);
});
$('reset').addEventListener('click', resetGame);
document.addEventListener('keydown', e => {
  if (!gameVisible || S.busy || !/^[1-4]$/.test(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
  const tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea' || !$('pal').hidden) return;
  const btn = choices.querySelectorAll('.opt')[+e.key - 1]; if (btn && !btn.disabled) btn.click();
});
setInterval(() => {
  const now = Date.now(), d = Math.min(1500, now - S.last); S.last = now;
  if (gameVisible && !document.hidden && !S.solved[S.cur] && !S.busy){ S.elapsed[S.cur] += d/1000; const t = $('timer'); if (t) t.textContent = fmt(S.elapsed[S.cur]); }
}, 250);

/* ================= projects (kubectl style) ================= */
const plist = $('plist'), pdetail = $('pdetail');
let curProj = 0;
const yl = (k,v) => `<span class="k">${esc(k)}</span><span class="p">:</span> ${v}`;
function renderProjects(){
  plist.innerHTML = '<div class="plist-h"><span>Kind</span><span>Name</span></div>' + PROJECTS.map((p,i) =>
    `<button type="button" class="prow" data-i="${i}" aria-pressed="${i===curProj}"><span class="kind">${esc(p.kind)}</span><span class="name">${esc(p.name)}<span class="sub">${esc(p.sub)}</span></span>${S.solved[i] ? '<span class="rs" title="Incident resolved">✓</span>' : '<span></span>'}</button>`).join('');
  const p = PROJECTS[curProj], inc = INCIDENTS[curProj], done = S.solved[curProj];
  const yaml =
    yl('apiVersion','<span class="s">portfolio/v1</span>')+'\n'+
    yl('kind','<span class="s">PersonalProject</span>')+'\n'+
    '<span class="k">metadata</span><span class="p">:</span>\n  '+yl('name','<span class="s">'+esc(p.slug)+'</span>')+'\n'+
    '<span class="k">spec</span><span class="p">:</span>\n  '+yl('focus','<span class="s">'+esc(p.sub)+'</span>')+'\n  '+
    yl('tools','<span class="p">[</span>'+p.tools.map(s => '<span class="s">'+esc(s)+'</span>').join('<span class="p">, </span>')+'<span class="p">]</span>')+'\n'+
    '<span class="k">status</span><span class="p">:</span>\n  '+yl('incident','<span class="s">'+inc.id+'</span>')+'\n  '+yl('resolved', done ? '<span class="s">true</span>' : '<span class="p">false</span>');
  pdetail.innerHTML =
    '<div class="pd-head"><h3>'+esc(p.name)+'</h3><span class="tag">Personal project</span></div>'+
    '<pre class="manifest">'+yaml+'</pre>'+
    '<div class="pd-body"><h4>What I practiced</h4><ul>'+p.points.map(t => '<li>'+esc(t)+'</li>').join('')+'</ul></div>'+
    '<div class="pd-foot"><span><b>Takeaway.</b> '+esc(inc.lesson)+'</span><button class="jump '+(done?'done':'')+'" type="button" data-inc="'+curProj+'">'+(done ? inc.id+' resolved. Replay' : 'Play '+inc.id)+'</button></div>';
}
plist.addEventListener('click', e => { const b = e.target.closest('.prow'); if (b){ curProj = +b.dataset.i; renderProjects(); } });
pdetail.addEventListener('click', e => { const b = e.target.closest('.jump'); if (b){ goto('incidents'); setTimeout(() => openInc(+b.dataset.inc), reduced ? 0 : 450); } });

/* ================= stack: exploded model + full tool list ================= */
$('stackgrid').innerHTML = STACK.map(s => `<div class="srow"><h4>${esc(s[0])}</h4><p>${esc(s[1])}</p><div class="chips">${s[2].map(c => `<span class="chip">${esc(c)}</span>`).join('')}</div></div>`).join('');
const rig = $('rig'), scene = $('scene'), range = $('explode'), llist = $('llist'), ldetail = $('ldetail');
let selLayer = 3;
LAYERS.forEach((L,i) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'slab'; b.style.setProperty('--i', i);
  b.setAttribute('aria-label', 'Layer ' + i + ': ' + L.name); b.dataset.i = i;
  b.innerHTML = `<span class="tg">L${i}</span><span class="nm">${esc(L.name)}</span>`; rig.appendChild(b);
});
llist.innerHTML = LAYERS.map((L,i) => `<li style="order:${-i}"><button type="button" data-i="${i}"><span>L${i}</span>${esc(L.name)}</button></li>`).join('');
function setGap(v){ rig.style.setProperty('--gap', (0.6 + (v/100)*3.8).toFixed(3)); }
function selectLayer(i){
  selLayer = i;
  rig.querySelectorAll('.slab').forEach(b => b.setAttribute('aria-pressed', +b.dataset.i === i ? 'true' : 'false'));
  llist.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.i === i ? 'true' : 'false'));
  const L = LAYERS[i];
  ldetail.innerHTML = `<h3>${esc(L.name)}</h3><p>${esc(L.desc)}</p><div class="chips">${L.tools.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    <div class="used"><span>Used in</span>${L.inc.map(k => `<button class="jump" type="button" data-inc="${k}">${INCIDENTS[k].id}</button>`).join('')}</div>`;
}
rig.addEventListener('click', e => { const b = e.target.closest('.slab'); if (b) selectLayer(+b.dataset.i); });
llist.addEventListener('click', e => { const b = e.target.closest('button'); if (b) selectLayer(+b.dataset.i); });
ldetail.addEventListener('click', e => { const b = e.target.closest('.jump'); if (b){ goto('incidents'); setTimeout(() => openInc(+b.dataset.inc), reduced ? 0 : 450); } });
range.addEventListener('input', () => setGap(+range.value));
function animateExplode(to, ms){
  const from = +range.value; if (reduced){ range.value = to; setGap(to); return; }
  const t0 = performance.now();
  (function step(now){ const p = Math.min(1, (now - t0)/ms), e = 1 - Math.pow(1-p, 3); const v = from + (to-from)*e; range.value = v; setGap(v); if (p < 1) requestAnimationFrame(step); })(t0);
}
scene.addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  const r = scene.getBoundingClientRect(), x = (e.clientX - r.left)/r.width - .5, y = (e.clientY - r.top)/r.height - .5;
  rig.style.setProperty('--rz', (-38 + x*34).toFixed(1) + 'deg'); rig.style.setProperty('--rx', (58 - y*16).toFixed(1) + 'deg');
});
scene.addEventListener('pointerleave', () => { rig.style.setProperty('--rz','-38deg'); rig.style.setProperty('--rx','58deg'); });
setGap(+range.value); selectLayer(selLayer);
if (window.IntersectionObserver && !reduced){
  const io = new IntersectionObserver(es => { if (es[0].isIntersecting){ io.disconnect(); range.value = 0; setGap(0); setTimeout(() => animateExplode(62, 1300), 250); } }, { threshold:.45 });
  io.observe(scene);
}

/* ================= interactive console ================= */
{
  const out = $('tout'), cmd = $('cmd');
  const line = (text, c) => { const d = document.createElement('div'); if (c) d.className = c; d.textContent = text; out.appendChild(d); };
  const gap = () => { const d = document.createElement('div'); d.className = 'gap'; out.appendChild(d); };
  const COMMANDS = {
    help(){
      line('available commands','hi');
      ['whoami            who I am','ls projects        list my projects','skills             tools by layer','education          degrees','contact            how to reach me','kubectl get nodes  sample lab cluster','pager              jump to the incident room','explode            pull the 3D stack apart','sudo hire-me       try it','clear              clear the screen'].forEach(t => line('  '+t,'res'));
    },
    whoami(){
      line('Ankit Saini','hi');
      line('Linux & Kubernetes Administrator | DevOps Engineer','res');
      line('BCA 2025 · Faridabad, Haryana · hands-on through personal projects','res');
    },
    ls(){ PROJECTS.forEach(p => line('drwxr-xr-x  '+p.slug+'/','res')); },
    skills(){ STACK.forEach(s => { line(s[0]+':','hi'); line('  '+s[2].join(', '),'res'); }); },
    education(){ line('2025  BCA, MDU Rohtak','res'); line('2022  Class XII Science, HBSE Board','res'); },
    contact(){ line('email  '+EMAIL,'res'); line('phone  '+PHONE,'res'); line('base   Faridabad, Haryana','res'); },
    nodes(){
      line('NAME             STATUS   ROLES','hi');
      line('control-plane    Ready    control-plane','okc');
      line('worker-1         Ready    worker','okc');
      line('worker-2         Ready    worker','okc');
      line('# illustrative output, not a live cluster','res');
    },
    hire(){
      line('[sudo] password for recruiter: ********','res');
      line('Access granted. Ankit is available for entry-level DevOps and Linux admin roles.','okc');
      line('Run `contact` to get in touch.','res');
    },
    pager(){ line('Paging the incident room...','res'); setTimeout(() => goto('incidents'), 250); },
    explode(){ line('Exploding the stack...','res'); goto('stack'); animateExplode(100, 900); }
  };
  function run(raw){
    const c = raw.trim().replace(/\s+/g,' ');
    if (!c) return;
    const low = c.toLowerCase();
    line(c,'cmd');
    if (low === 'clear'){ out.innerHTML = ''; return; }
    if (low === 'help' || low === '?') COMMANDS.help();
    else if (low === 'whoami') COMMANDS.whoami();
    else if (low === 'ls' || low === 'ls projects' || low === 'ls projects/' || low === 'projects') COMMANDS.ls();
    else if (low === 'skills' || low === 'cat skills') COMMANDS.skills();
    else if (low === 'education' || low === 'edu') COMMANDS.education();
    else if (low === 'contact' || low === 'email') COMMANDS.contact();
    else if (low === 'kubectl get nodes' || low === 'kubectl get no') COMMANDS.nodes();
    else if (low === 'sudo hire-me' || low === 'sudo hire me') COMMANDS.hire();
    else if (low === 'pager' || low === 'play') COMMANDS.pager();
    else if (low === 'explode') COMMANDS.explode();
    else if (low.indexOf('sudo ') === 0) line('ankit is not in the sudoers file for that. This incident will be reported.','res');
    else line(c.split(' ')[0]+': command not found. Try `help`.','res');
    gap();
    out.scrollTop = out.scrollHeight;
  }
  $('tf').addEventListener('submit', e => { e.preventDefault(); run(cmd.value); cmd.value = ''; });
  ['help','whoami','ls projects','skills','kubectl get nodes','pager','sudo hire-me','contact','clear'].forEach(c => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = c;
    b.addEventListener('click', () => run(c));
    $('tchips').appendChild(b);
  });
  run('whoami'); run('ls projects'); out.scrollTop = 0;
}

/* ================= contact ================= */
document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => {
  const el = $(b.dataset.copy), txt = el.textContent;
  const done = ok => { b.textContent = ok ? 'Copied' : 'Select it'; setTimeout(() => { b.textContent = 'Copy'; }, 1600); };
  const fb = () => { try { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch(e){} done(false); };
  try { navigator.clipboard.writeText(txt).then(() => done(true), fb); } catch(e){ fb(); }
}));
$('ack').addEventListener('click', () => {
  $('pc-sev').textContent = 'ACKNOWLEDGED'; $('ack').textContent = 'Page acknowledged';
  $('ack-p').textContent = 'Thanks. Email or phone are below.';
});

/* ================= command menu ================= */
const pal = $('pal'), palq = $('palq'), pall = $('pall');
let palItems = [], palSel = 0, palFrom = null;
const actions = () => [
  { t:'Go to the incident room', h:'Go', f:() => goto('incidents') },
  { t:'Go to projects', h:'Go', f:() => goto('projects') },
  { t:'Go to the stack', h:'Go', f:() => goto('stack') },
  { t:'Go to the console', h:'Go', f:() => goto('console') },
  { t:'Go to education', h:'Go', f:() => goto('education') },
  { t:'Go to contact', h:'Go', f:() => goto('contact') },
  ...INCIDENTS.map((n,i) => ({ t:'Open ' + n.id + ': ' + n.short, h:'Incident', f:() => { goto('incidents'); setTimeout(() => openInc(i), reduced ? 0 : 450); } })),
  { t:'Explode the stack', h:'Stack', f:() => { goto('stack'); animateExplode(100, 900); } },
  { t:'Assemble the stack', h:'Stack', f:() => { goto('stack'); animateExplode(0, 900); } },
  { t:'Copy email address', h:'Copy', f:() => copyText(EMAIL, 'Email copied') },
  { t:'Copy phone number', h:'Copy', f:() => copyText(PHONE, 'Phone number copied') },
  { t:'Switch theme', h:'View', f:toggleTheme }
];
function palRender(){
  const q = palq.value.trim().toLowerCase();
  palItems = actions().filter(a => !q || (a.t + ' ' + a.h).toLowerCase().includes(q));
  palSel = Math.min(palSel, Math.max(0, palItems.length - 1));
  pall.innerHTML = palItems.length ? palItems.map((a,i) => `<li role="option" data-i="${i}" aria-selected="${i===palSel}"><span>${esc(a.t)}</span><small>${a.h}</small></li>`).join('') : '<li class="none">Nothing matches. Try "stack" or "copy".</li>';
}
function palOpen(){ palFrom = document.activeElement; pal.hidden = false; palq.value = ''; palSel = 0; palRender(); palq.focus(); }
function palClose(){ pal.hidden = true; if (palFrom && palFrom.focus) palFrom.focus(); }
function palRun(i){ const a = palItems[i]; if (!a) return; palClose(); setTimeout(a.f, 30); }
$('kbtn').addEventListener('click', palOpen);
palq.addEventListener('input', () => { palSel = 0; palRender(); });
palq.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown'){ e.preventDefault(); palSel = Math.min(palItems.length-1, palSel+1); palRender(); pall.querySelector('[aria-selected="true"]')?.scrollIntoView({ block:'nearest' }); }
  else if (e.key === 'ArrowUp'){ e.preventDefault(); palSel = Math.max(0, palSel-1); palRender(); pall.querySelector('[aria-selected="true"]')?.scrollIntoView({ block:'nearest' }); }
  else if (e.key === 'Enter'){ e.preventDefault(); palRun(palSel); }
  else if (e.key === 'Tab'){ e.preventDefault(); }
});
pall.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) palRun(+li.dataset.i); });
pal.addEventListener('pointerdown', e => { if (e.target === pal) palClose(); });
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); pal.hidden ? palOpen() : palClose(); }
  else if (e.key === 'Escape' && !pal.hidden) palClose();
});

/* ================= boot ================= */
renderProjects(); openInc(0, true);
})();
