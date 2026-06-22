# 🪨📄✂️ Pierre Papier Ciseaux

Un jeu de **Pierre Papier Ciseaux** moderne et interactif, entièrement en HTML/CSS/JavaScript pur — avec un mode **solo contre l'IA** et un mode **multijoueur en temps réel** via WebRTC (PeerJS).

![Preview](https://img.shields.io/badge/version-1.0.0-blueviolet?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Fonctionnalités

### 🤖 Mode Solo — Vs IA
- Affrontez une intelligence artificielle
- Animations fluides de révélation du choix
- Système de **confettis** lors des victoires
- Historique des 10 derniers rounds
- Support clavier : touches `1` `2` `3` ou `Q` `W` `E`

### 👥 Mode Multijoueur — Temps Réel
- Connexion **peer-to-peer** (WebRTC via PeerJS) — aucun serveur requis
- Créez une partie avec un **code à 6 chiffres**
- Partagez le code à votre adversaire pour le rejoindre
- **Pseudos** personnalisables pour chaque joueur
- Révélation simultanée des choix
- Indicateur de connexion en temps réel 🟢

### 🏁 Système de Partie
- Premier à **5 victoires** remporte la partie
- **Pips visuels** (●●●●●) pour suivre la progression
- Modal de fin de partie avec option **Revanche**
- Scoreboard persistant par round

---

## 🎨 Design

- Interface **dark mode** premium
- Effets **glassmorphism** et dégradés
- Orbes animées en arrière-plan
- Micro-animations sur chaque interaction
- Police **Outfit** (Google Fonts)
- Totalement **responsive** : mobile, tablette, desktop

---

## 📱 Compatibilité

| Appareil | Support |
|---|---|
| 📱 Petits téléphones (< 400px) | ✅ |
| 📱 Téléphones standard | ✅ |
| 📟 Tablettes | ✅ |
| 💻 Desktop | ✅ |
| 🖥️ Grand écran | ✅ |
| 🔄 Paysage mobile | ✅ |
| ♿ `prefers-reduced-motion` | ✅ |

---

## 🚀 Lancement

### En local
Aucune installation requise. Ouvrez simplement `index.html` dans votre navigateur :

```bash
# Cloner le dépôt
git clone https://github.com/jayriri60-ai/exercice.git

# Ouvrir dans le navigateur
start exercice/index.html
```

### Héberger en ligne
Compatible avec tout hébergeur de fichiers statiques :
- [InfinityFree](https://infinityfree.com) (gratuit)
- [GitHub Pages](https://pages.github.com)
- [Netlify](https://netlify.com)
- [Vercel](https://vercel.com)

> **Note :** Pour le mode multijoueur en production, activez le **HTTPS** sur votre hébergeur (PeerJS l'exige).

---

## 📁 Structure du projet

```
exercice/
├── index.html   # Structure HTML (3 écrans + modal)
├── style.css    # Design, animations, responsive
├── script.js    # Logique de jeu + PeerJS multijoueur
└── README.md    # Ce fichier
```

---

## 🎮 Comment jouer

### Solo (vs IA)
1. Cliquez sur **"Vs Intelligence Artificielle"**
2. Choisissez **🪨 Pierre**, **📄 Papier** ou **✂️ Ciseaux**
3. L'IA révèle son choix — le premier à **5 victoires** gagne !

### Multijoueur
1. Cliquez sur **"Multijoueur"**
2. Entrez votre **pseudo**
3. **Joueur A** → "Créer la partie" → partage le code à 6 chiffres
4. **Joueur B** → "Rejoindre" → saisit le code
5. La partie commence automatiquement — bonne chance ! 🏆

---

## 🛠️ Technologies

| Techno | Usage |
|---|---|
| **HTML5** | Structure sémantique |
| **CSS3** | Design, animations, responsive (6 breakpoints) |
| **JavaScript ES2022** | Logique de jeu, async/await |
| **PeerJS 1.5.4** | WebRTC peer-to-peer pour le multijoueur |
| **Google Fonts (Outfit)** | Typographie |

---

## 👤 Auteur

**jayriri60-ai** — [@jayriri60-ai](https://github.com/jayriri60-ai)

---

## 📄 Licence

Ce projet est open source sous licence [MIT](LICENSE).
