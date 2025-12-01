# 🤝 Guide de Contribution

Merci de contribuer à ImuChat ! Ce guide explique comment contribuer efficacement.

## 📋 Table des matières

1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Workflow Git](#workflow-git)
4. [Standards de Code](#standards-de-code)
5. [Pull Requests](#pull-requests)
6. [Issues](#issues)

---

## 📜 Code de Conduite

- Soyez respectueux et inclusif
- Acceptez les critiques constructives
- Concentrez-vous sur ce qui est le mieux pour la communauté
- Faites preuve d'empathie envers les autres

---

## 🚀 Comment Contribuer

### Types de contributions

- 🐛 **Bug fixes** : Corriger un bug existant
- ✨ **Features** : Ajouter une nouvelle fonctionnalité
- 📚 **Documentation** : Améliorer la doc
- 🧪 **Tests** : Ajouter des tests
- ♻️ **Refactoring** : Améliorer le code existant

### Étapes

1. **Vérifier les issues existantes** avant de créer une nouvelle
2. **Discuter** les grandes features avant de coder
3. **Forker** le repo concerné
4. **Créer une branche** depuis `main`
5. **Coder** en suivant les conventions
6. **Tester** localement
7. **Ouvrir une PR** avec une description claire

---

## 🌿 Workflow Git

### Branches

```
main          ← Production (protégée)
├── develop   ← Développement
├── feature/* ← Nouvelles fonctionnalités
├── fix/*     ← Corrections de bugs
├── chore/*   ← Maintenance
└── docs/*    ← Documentation
```

### Nommage des branches

```bash
feature/user-authentication
fix/login-button-not-working
chore/update-dependencies
docs/api-documentation
```

### Conventional Commits

Format : `type(scope): description`

```bash
# Types
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatage (pas de changement de code)
refactor: # Refactoring
test:     # Ajout de tests
chore:    # Maintenance

# Exemples
feat(auth): add Google OAuth login
fix(chat): resolve message ordering issue
docs(api): update authentication endpoints
chore(deps): update React to v18.2
```

### Workflow type

```bash
# 1. Mettre à jour main
git checkout main
git pull origin main

# 2. Créer une branche
git checkout -b feature/my-feature

# 3. Coder et commiter
git add .
git commit -m "feat: add my feature"

# 4. Rebaser si nécessaire
git fetch origin
git rebase origin/main

# 5. Pousser
git push origin feature/my-feature

# 6. Ouvrir une PR sur GitHub
```

---

## 📏 Standards de Code

### TypeScript

```typescript
// ✅ Bon
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Mauvais
function getUser(id: any): any {
  // ...
}
```

### React

```tsx
// ✅ Bon - Composant fonctionnel avec types
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      className={cn('btn', `btn-${variant}`)}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ❌ Mauvais
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Tests

```typescript
// Nommage des tests
describe('UserService', () => {
  describe('getUser', () => {
    it('should return user when id exists', async () => {
      // Arrange
      const userId = '123';
      
      // Act
      const user = await userService.getUser(userId);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
    });

    it('should throw NotFoundError when id does not exist', async () => {
      // ...
    });
  });
});
```

### Linting

```bash
# Vérifier le code
pnpm lint

# Corriger automatiquement
pnpm lint:fix

# Formater
pnpm format
```

---

## 🔍 Pull Requests

### Checklist avant PR

- [ ] Code testé localement
- [ ] Tests ajoutés/mis à jour
- [ ] Lint passe sans erreurs
- [ ] Documentation mise à jour si nécessaire
- [ ] Commits suivent Conventional Commits
- [ ] Branche à jour avec `main`

### Template de PR

```markdown
## Description

Brève description des changements.

## Type de changement

- [ ] Bug fix
- [ ] Nouvelle feature
- [ ] Breaking change
- [ ] Documentation

## Comment tester

1. Étape 1
2. Étape 2
3. Vérifier que...

## Screenshots (si applicable)

## Checklist

- [ ] Mon code suit les conventions du projet
- [ ] J'ai ajouté des tests
- [ ] J'ai mis à jour la documentation
```

### Review

- Répondez aux commentaires
- Faites les modifications demandées
- Re-demandez une review après corrections

---

## 🐛 Issues

### Créer une bonne issue

#### Bug Report

```markdown
## Description du bug

Description claire du problème.

## Étapes pour reproduire

1. Aller sur '...'
2. Cliquer sur '...'
3. Voir l'erreur

## Comportement attendu

Ce qui devrait se passer.

## Comportement actuel

Ce qui se passe réellement.

## Screenshots

Si applicable.

## Environnement

- OS: [ex: macOS 14]
- Browser: [ex: Chrome 120]
- Version: [ex: 1.0.0]
```

#### Feature Request

```markdown
## Description de la feature

Description claire de la fonctionnalité souhaitée.

## Motivation

Pourquoi cette feature est nécessaire.

## Solution proposée

Comment vous imaginez la solution.

## Alternatives considérées

Autres solutions envisagées.
```

### Labels

| Label | Description |
|-------|-------------|
| `bug` | Quelque chose ne fonctionne pas |
| `feature` | Nouvelle fonctionnalité |
| `enhancement` | Amélioration |
| `documentation` | Documentation |
| `good first issue` | Bon pour les nouveaux contributeurs |
| `help wanted` | Besoin d'aide |
| `priority: high` | Urgent |

---

## ❓ Questions ?

- Ouvrir une discussion GitHub
- Demander sur Slack `#dev-imuchat`

**Merci pour vos contributions ! 🙏**
