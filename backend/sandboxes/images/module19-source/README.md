# Module 19 — clés de déploiement (lab mouvement latéral SSH)

La paire de clés `deploy_key` / `deploy_key.pub` est **générée localement** et
**volontairement non committée** (une clé privée en dépôt déclencherait le
secret scanning et n'a de valeur que dans ce lab jetable).

Sur une nouvelle machine, régénère-la **avant de builder** les deux images :

```bash
ssh-keygen -t ed25519 -f backend/sandboxes/images/module19-source/deploy_key -N "" -C "backup-deploy"
cp backend/sandboxes/images/module19-source/deploy_key.pub backend/sandboxes/images/module19-target/deploy_key.pub
```

- `module19-source` embarque la **clé privée** en `/opt/backup/deploy_key` (perms 644 = lisible par tous : c'est la vulnérabilité).
- `module19-target` embarque la **clé publique** comme `authorized_keys` de `backup-svc`.
