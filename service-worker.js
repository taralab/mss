// Récupération du chemin de base
const serviceWorkerUrl = self.location.href;
const basePath = serviceWorkerUrl.replace(/service-worker\.js$/, '');

console.log(`[SERVICE WORKER] : BasePath = ${basePath}`);

// Nom de la version du cache
const CACHE_VERSION = "V1.7.6"; // Incrémente la version à chaque mise à jour
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Les js et css (fichiers critiques : Network First)
const CRITICAL_ASSETS = [
  `${basePath}styles/global.css`,
  `${basePath}scripts/pouchdb.min.js`,
  `${basePath}scripts/scripts/template.js`,
  `${basePath}scripts/globalFunction.js`,
  `${basePath}scripts/activityList.js`,
  `${basePath}scripts/activitySystem.js`,
  `${basePath}scripts/app.js`,
  `${basePath}scripts/favoris.js`,
  `${basePath}scripts/gestData.js`,
  `${basePath}scripts/info.js`,
  `${basePath}scripts/profil.js`,
  `${basePath}scripts/notify.js`,
  `${basePath}scripts/rewardData.js`,
  `${basePath}scripts/setting.js`,
  `${basePath}scripts/sortAndFilter.js`,
  `${basePath}scripts/stat.js`,
  `${basePath}scripts/rewards.js`,
  `${basePath}scripts/session.js`,
  `${basePath}scripts/templateSession.js`,
  `${basePath}scripts/planning.js`
];

// Fichiers à mettre en cache (non critiques : Cache First)
const STATIC_FILES = [
  `${basePath}offline.html`,
  `${basePath}Icons/Icon-No-Network.webp` // image pour l'état hors ligne
];

// Liste des fichiers explicites pour les trois dossiers
const ICONS = [
  `${basePath}Icons/Icon-Accepter.webp`,
  `${basePath}Icons/Icon-Select-Full.webp`,
  `${basePath}Icons/Icon-Select-empty.webp`,
  `${basePath}Icons/Icon-From-Modele.webp`,
  `${basePath}Icons/Icon-Autres.webp`,
  `${basePath}Icons/Icon-Delete.webp`,
  `${basePath}Icons/Icon-Download.webp`,
  `${basePath}Icons/Icon-Favoris.webp`,
  `${basePath}Icons/Icon-Favoris-Sel.webp`,
  `${basePath}Icons/Icon-Info.webp`,
  `${basePath}Icons/Icon-New.webp`,
  `${basePath}Icons/Icon-Profil.webp`,
  `${basePath}Icons/Icon-Return-cancel.webp`,
  `${basePath}Icons/Icon-Setting.webp`,
  `${basePath}Icons/Icon-Stat.webp`,
  `${basePath}Icons/Icon-Trophy.webp`,
  `${basePath}Icons/Icon-Upload.webp`,
  `${basePath}Icons/Icon-Valider.webp`,
  `${basePath}Icons/Logo_MSS-192.png`,
  `${basePath}Icons/Logo_MSS-512.png`,
  `${basePath}Icons/MSS-Logo.ico`,
  `${basePath}Icons/notifyBadge48.png`,
  `${basePath}Icons/notifyRewardsColor192.png`,
  `${basePath}Icons/MSS_Prod-QR-code.webp`,
  `${basePath}Icons/Icon-Favoris-Menu.webp`,
  `${basePath}Icons/Icon-wait.webp`,
  `${basePath}Icons/Icon-Plus.webp`,
  `${basePath}Icons/Icon-Set-Template.webp`,
  `${basePath}Icons/badge-locked.webp`,
  `${basePath}Icons/Icon-Share.webp`,
  `${basePath}Icons/RewardShareBackground.webp`,
  `${basePath}Icons/Icon-Counter.webp`,
  `${basePath}Icons/Icon-Reset.webp`,
  `${basePath}Icons/Icon-Delete-color.webp`,
  `${basePath}Icons/Icon-nav-increase.webp`,
  `${basePath}Icons/Icon-nav-decrease.webp`,
  `${basePath}Icons/Icon-Session.webp`,
  `${basePath}Icons/Icon-Send.webp`,
  `${basePath}Icons/Icon-Counter-Done.webp`,
  `${basePath}Icons/Icon-Close.webp`,
  `${basePath}Icons/Icon-Search.webp`,
  `${basePath}Icons/Background-texture.webp`,
  `${basePath}Icons/Icon-Agenda-Hebdo.webp`
];

const IMAGES = [
  `${basePath}images/icon-art-martiaux.webp`,
  `${basePath}images/icon-autre-divers.webp`,
  `${basePath}images/icon-All.webp`,
  `${basePath}images/icon-isPlanned.webp`,
  `${basePath}images/icon-badminton.webp`,
  `${basePath}images/icon-baseball.webp`,
  `${basePath}images/icon-basketball.webp`,
  `${basePath}images/icon-boxe.webp`,
  `${basePath}images/icon-breakdance.webp`,
  `${basePath}images/icon-cap.webp`,
  `${basePath}images/icon-crossfit.webp`,
  `${basePath}images/icon-danse.webp`,
  `${basePath}images/icon-equitation.webp`,
  `${basePath}images/icon-escalade.webp`,
  `${basePath}images/icon-football.webp`,
  `${basePath}images/icon-golf.webp`,
  `${basePath}images/icon-handball.webp`,
  `${basePath}images/icon-intense-running.webp`,
  `${basePath}images/icon-marche.webp`,
  `${basePath}images/icon-musculation.webp`,
  `${basePath}images/icon-natation.webp`,
  `${basePath}images/icon-nautique.webp`,
  `${basePath}images/icon-patin.webp`,
  `${basePath}images/icon-rugby.webp`,
  `${basePath}images/icon-ski.webp`,
  `${basePath}images/icon-snowboard.webp`,
  `${basePath}images/icon-sport-co.webp`,
  `${basePath}images/icon-stretching.webp`,
  `${basePath}images/icon-tennis.webp`,
  `${basePath}images/icon-tennis-de-table.webp`,
  `${basePath}images/icon-triathlon.webp`,
  `${basePath}images/icon-velo.webp`,
  `${basePath}images/icon-volley.webp`,
  `${basePath}images/icon-yoga.webp`,
  `${basePath}images/icon-skate.webp`,
  `${basePath}images/icon-renforcement.webp`,
  `${basePath}images/icon-athletisme.webp`,
  `${basePath}images/icon-gymnastique.webp`
];

const BADGES = [
  `${basePath}Badges/Badge-1-an.webp`,
  `${basePath}Badges/Badge-ACTIVITE-100.webp`,
  `${basePath}Badges/BADGE-ACTIVITE-FIRST.webp`,
  `${basePath}Badges/Badge-ACTIVITE-NAUTIQUE-A.webp`,
  `${basePath}Badges/Badge-ACTIVITE-NAUTIQUE-B.webp`,
  `${basePath}Badges/Badge-ACTIVITE-NAUTIQUE-C.webp`,
  `${basePath}Badges/Badge-ACTIVITE-NAUTIQUE-D.webp`,
  `${basePath}Badges/Badge-ARTS-MARTIAUX-A.webp`,
  `${basePath}Badges/Badge-ARTS-MARTIAUX-B.webp`,
  `${basePath}Badges/Badge-ARTS-MARTIAUX-C.webp`,
  `${basePath}Badges/Badge-ARTS-MARTIAUX-D.webp`,
  `${basePath}Badges/Badge-ATHLETISME-A.webp`,
  `${basePath}Badges/Badge-ATHLETISME-B.webp`,
  `${basePath}Badges/Badge-ATHLETISME-C.webp`,
  `${basePath}Badges/Badge-ATHLETISME-D.webp`,
  `${basePath}Badges/Badge-AUTRE-A.webp`,
  `${basePath}Badges/Badge-BADMINTON-A.webp`,
  `${basePath}Badges/Badge-BADMINTON-B.webp`,
  `${basePath}Badges/Badge-BADMINTON-C.webp`,
  `${basePath}Badges/Badge-BADMINTON-D.webp`,
  `${basePath}Badges/Badge-BASEBALL-A.webp`,
  `${basePath}Badges/Badge-BASEBALL-B.webp`,
  `${basePath}Badges/Badge-BASEBALL-C.webp`,
  `${basePath}Badges/Badge-BASEBALL-D.webp`,
  `${basePath}Badges/Badge-BASKETBALL-A.webp`,
  `${basePath}Badges/Badge-BASKETBALL-B.webp`,
  `${basePath}Badges/Badge-BASKETBALL-C.webp`,
  `${basePath}Badges/Badge-BASKETBALL-D.webp`,
  `${basePath}Badges/Badge-BOXE-A.webp`,
  `${basePath}Badges/Badge-BOXE-B.webp`,
  `${basePath}Badges/Badge-BOXE-C.webp`,
  `${basePath}Badges/Badge-BOXE-D.webp`,
  `${basePath}Badges/Badge-BREAK-DANCE-A.webp`,
  `${basePath}Badges/Badge-BREAK-DANCE-B.webp`,
  `${basePath}Badges/Badge-BREAK-DANCE-C.webp`,
  `${basePath}Badges/Badge-BREAK-DANCE-D.webp`,
  `${basePath}Badges/Badge-CAP-A.webp`,
  `${basePath}Badges/Badge-CAP-B.webp`,
  `${basePath}Badges/Badge-CAP-C.webp`,
  `${basePath}Badges/Badge-CAP-D.webp`,
  `${basePath}Badges/Badge-CAP-E.webp`,
  `${basePath}Badges/Badge-CAP-F.webp`,
  `${basePath}Badges/Badge-CAP-G.webp`,
  `${basePath}Badges/Badge-CAP-H.webp`,
  `${basePath}Badges/Badge-CROSSFIT-A.webp`,
  `${basePath}Badges/Badge-CROSSFIT-B.webp`,
  `${basePath}Badges/Badge-CROSSFIT-C.webp`,
  `${basePath}Badges/Badge-CROSSFIT-D.webp`,
  `${basePath}Badges/Badge-DANSE-A.webp`,
  `${basePath}Badges/Badge-DANSE-B.webp`,
  `${basePath}Badges/Badge-DANSE-C.webp`,
  `${basePath}Badges/Badge-DANSE-D.webp`,
  `${basePath}Badges/Badge-DE-RETOUR.webp`,
  `${basePath}Badges/Badge-EQUITATION-A.webp`,
  `${basePath}Badges/Badge-EQUITATION-B.webp`,
  `${basePath}Badges/Badge-EQUITATION-C.webp`,
  `${basePath}Badges/Badge-EQUITATION-D.webp`,
  `${basePath}Badges/Badge-ESCALADE-A.webp`,
  `${basePath}Badges/Badge-ESCALADE-B.webp`,
  `${basePath}Badges/Badge-ESCALADE-C.webp`,
  `${basePath}Badges/Badge-ESCALADE-D.webp`,
  `${basePath}Badges/Badge-ETIREMENT-A.webp`,
  `${basePath}Badges/Badge-ETIREMENT-B.webp`,
  `${basePath}Badges/Badge-ETIREMENT-C.webp`,
  `${basePath}Badges/Badge-ETIREMENT-D.webp`,
  `${basePath}Badges/Badge-FOOTBALL-A.webp`,
  `${basePath}Badges/Badge-FOOTBALL-B.webp`,
  `${basePath}Badges/Badge-FOOTBALL-C.webp`,
  `${basePath}Badges/Badge-FOOTBALL-D.webp`,
  `${basePath}Badges/Badge-FRACTIONNE-A.webp`,
  `${basePath}Badges/Badge-FRACTIONNE-B.webp`,
  `${basePath}Badges/Badge-FRACTIONNE-C.webp`,
  `${basePath}Badges/Badge-FRACTIONNE-D.webp`,
  `${basePath}Badges/Badge-GOLF-A.webp`,
  `${basePath}Badges/Badge-GOLF-B.webp`,
  `${basePath}Badges/Badge-GOLF-C.webp`,
  `${basePath}Badges/Badge-GOLF-D.webp`,
  `${basePath}Badges/Badge-GYMNASTIQUE-A.webp`,
  `${basePath}Badges/Badge-GYMNASTIQUE-B.webp`,
  `${basePath}Badges/Badge-GYMNASTIQUE-C.webp`,
  `${basePath}Badges/Badge-GYMNASTIQUE-D.webp`,
  `${basePath}Badges/Badge-HANDBALL-A.webp`,
  `${basePath}Badges/Badge-HANDBALL-B.webp`,
  `${basePath}Badges/Badge-HANDBALL-C.webp`,
  `${basePath}Badges/Badge-HANDBALL-D.webp`,
  `${basePath}Badges/Badge-MARCHE-RANDO-A.webp`,
  `${basePath}Badges/Badge-MARCHE-RANDO-B.webp`,
  `${basePath}Badges/Badge-MARCHE-RANDO-C.webp`,
  `${basePath}Badges/Badge-MARCHE-RANDO-D.webp`,
  `${basePath}Badges/Badge-MARCHE-RANDO-E.webp`,
  `${basePath}Badges/Badge-MUSCULATION-A.webp`,
  `${basePath}Badges/Badge-MUSCULATION-B.webp`,
  `${basePath}Badges/Badge-MUSCULATION-C.webp`,
  `${basePath}Badges/Badge-MUSCULATION-D.webp`,
  `${basePath}Badges/Badge-NATATION-A.webp`,
  `${basePath}Badges/Badge-NATATION-B.webp`,
  `${basePath}Badges/Badge-NATATION-C.webp`,
  `${basePath}Badges/Badge-NATATION-D.webp`,
  `${basePath}Badges/Badge-NATATION-E.webp`,
  `${basePath}Badges/Badge-PATIN-ROLLER-A.webp`,
  `${basePath}Badges/Badge-PATIN-ROLLER-B.webp`,
  `${basePath}Badges/Badge-PATIN-ROLLER-C.webp`,
  `${basePath}Badges/Badge-PATIN-ROLLER-D.webp`,
  `${basePath}Badges/Badge-POLYVALENT.webp`,
  `${basePath}Badges/Badge-RENFORCEMENT-A.webp`,
  `${basePath}Badges/Badge-RENFORCEMENT-B.webp`,
  `${basePath}Badges/Badge-RENFORCEMENT-C.webp`,
  `${basePath}Badges/Badge-RENFORCEMENT-D.webp`,
  `${basePath}Badges/Badge-RUGBY-A.webp`,
  `${basePath}Badges/Badge-RUGBY-B.webp`,
  `${basePath}Badges/Badge-RUGBY-C.webp`,
  `${basePath}Badges/Badge-RUGBY-D.webp`,
  `${basePath}Badges/Badge-SKATEBOARD-A.webp`,
  `${basePath}Badges/Badge-SKATEBOARD-B.webp`,
  `${basePath}Badges/Badge-SKATEBOARD-C.webp`,
  `${basePath}Badges/Badge-SKATEBOARD-D.webp`,
  `${basePath}Badges/Badge-SKI-A.webp`,
  `${basePath}Badges/Badge-SKI-B.webp`,
  `${basePath}Badges/Badge-SKI-C.webp`,
  `${basePath}Badges/Badge-SKI-D.webp`,
  `${basePath}Badges/Badge-SNOWBOARD-A.webp`,
  `${basePath}Badges/Badge-SNOWBOARD-B.webp`,
  `${basePath}Badges/Badge-SNOWBOARD-C.webp`,
  `${basePath}Badges/Badge-SNOWBOARD-D.webp`,
  `${basePath}Badges/Badge-SPORT-CO-A.webp`,
  `${basePath}Badges/Badge-SPORT-CO-B.webp`,
  `${basePath}Badges/Badge-SPORT-CO-C.webp`,
  `${basePath}Badges/Badge-SPORT-CO-D.webp`,
  `${basePath}Badges/Badge-TENNIS-A.webp`,
  `${basePath}Badges/Badge-TENNIS-B.webp`,
  `${basePath}Badges/Badge-TENNIS-C.webp`,
  `${basePath}Badges/Badge-TENNIS-D.webp`,
  `${basePath}Badges/Badge-TENNIS-DE-TABLE-A.webp`,
  `${basePath}Badges/Badge-TENNIS-DE-TABLE-B.webp`,
  `${basePath}Badges/Badge-TENNIS-DE-TABLE-C.webp`,
  `${basePath}Badges/Badge-TENNIS-DE-TABLE-D.webp`,
  `${basePath}Badges/Badge-TRIATHLON-A.webp`,
  `${basePath}Badges/Badge-VELO-A.webp`,
  `${basePath}Badges/Badge-VELO-B.webp`,
  `${basePath}Badges/Badge-VELO-C.webp`,
  `${basePath}Badges/Badge-VELO-D.webp`,
  `${basePath}Badges/Badge-VELO-E.webp`,
  `${basePath}Badges/Badge-VELO-F.webp`,
  `${basePath}Badges/Badge-VOLLEYBALL-A.webp`,
  `${basePath}Badges/Badge-VOLLEYBALL-B.webp`,
  `${basePath}Badges/Badge-VOLLEYBALL-C.webp`,
  `${basePath}Badges/Badge-VOLLEYBALL-D.webp`,
  `${basePath}Badges/Badge-YOGA-A.webp`,
  `${basePath}Badges/Badge-YOGA-B.webp`,
  `${basePath}Badges/Badge-YOGA-C.webp`,
  `${basePath}Badges/Badge-YOGA-D.webp`
];

// Combiner toutes les ressources dans un seul tableau et dédupliquer
const ALL_FILES_TO_CACHE = [...new Set([...STATIC_FILES, ...ICONS, ...IMAGES, ...BADGES])];

// Évènement d'installation
self.addEventListener("install", (event) => {
  console.log(`[SERVICE WORKER] : ${CACHE_VERSION} Installation`);

  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      console.log(`[SERVICE WORKER] : ${CACHE_VERSION} Mise en cache des fichiers`);
      await cache.addAll(ALL_FILES_TO_CACHE);
    })()
  );

  self.skipWaiting(); // Pour activer immédiatement la nouvelle version
});


// Après avoir mis à jour le cache avec la nouvelle version, envoyer un message à la page
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting' && self.waiting) {
    self.skipWaiting();
  }
});




// Événement d'activation : envoyer un message à la page quand la mise à jour est prête
self.addEventListener('activate', (event) => {
  console.log('[SERVICE WORKER] : Activation');

  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      console.log('Caches existants:', keys);
      
      await Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE) {
            console.log(`[SERVICE WORKER] : Suppression de l'ancien cache ${key}`);
            return caches.delete(key);
          }
        })
      );

      self.clients.claim();
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: "UPDATE_READY" });
        });
      });
    })()
  );
});


// Vérification des ressources lors des demandes
self.addEventListener("fetch", (event) => {
  console.log(`[SERVICE WORKER] : ${CACHE_VERSION} Interception de ${event.request.url}`);

  // Si la demande concerne un fichier critique (JS/CSS), on utilise Network-First
  if (CRITICAL_ASSETS.some(asset => event.request.url.includes(asset))) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(event.request);

        // Network-First : Essaie de récupérer depuis le réseau en priorité
        try {
          const networkResponse = await fetch(event.request);
          // Cloner la réponse avant de la mettre en cache
          const networkResponseClone = networkResponse.clone();
          // Mettre à jour le cache en arrière-plan
          cache.put(event.request, networkResponseClone);
          return networkResponse;
        } catch (error) {
          // Si une erreur se produit, renvoyer la réponse en cache
          return cachedResponse || cache.match(`${basePath}offline.html`);
        }
      })()
    );
  }

  // Si la demande concerne un fichier non critique (image, icône, etc.), on utilise Cache-First
  else {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
          return cachedResponse; // Si la ressource est dans le cache, la renvoyer
        }

        // Sinon, tenter de récupérer la ressource depuis le réseau
        try {
          const networkResponse = await fetch(event.request);
          // Cloner la réponse avant de la mettre en cache
          const networkResponseClone = networkResponse.clone();
          // Mettre à jour le cache avec la nouvelle réponse
          cache.put(event.request, networkResponseClone);
          return networkResponse;
        } catch (error) {
          console.log(`[SERVICE WORKER] : ${CACHE_VERSION} Erreur réseau pour ${event.request.url}`);
          return cache.match(`${basePath}offline.html`);
        }
      })()
    );
  }
});

// Action lorsque l'utilisateur clique sur la notification (actuellement ferme la notification)
self.addEventListener('notificationclick', event => {
  event.notification.close();
  console.log('Notification cliquée.');
});
