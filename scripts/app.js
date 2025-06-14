let animCascadeDelay = 60;//milisecondes de l'animation cascade

// Detection de l'environnement
const envPath = window.location.pathname; // exemple: "/mss/index.html"
const envBaseFolder = envPath.split('/')[1]; // "mss"

if (envBaseFolder !== "mss") {
    // document.getElementById("divHeader").classList.add("header-dev");
    console.log("configuration style dev");
}


// ------------------------- CONDITION D'UTILISATION ---------------------------



function onGenerateConditionUtilisation() {
    // Insert les conditions dynamique dans l'emplacement
    document.getElementById("divConditionDynamicText").innerHTML = conditionText;
    // Affichage
    onChangeDisplay(allDivHomeToDisplayNone,["divConditionUtilisation"],[],[],[],["launch-btn"],[]);
    if (devMode === true){console.log("Génération du popup des conditions d'utilisation");};

};

// Acceptation des conditions d'utilisations

async function onClickAcceptCondition() {
    if (devMode === true){console.log("Acceptation des conditions d'utilisation");};

    userInfo.conditionAccepted = true;

    //Sauvegarde
    await updateDocumentInDB(profilStoreName, (doc) => {
        doc.data = userInfo;
        return doc;
    });

    onLeaveMenu("userCondition");
};

// gestion de la Checkbox d'acceptation
function toggleLaunchButton() {
    let selectStatusConditionRef = document.getElementById("selectStatusCondition");
    let launchBtn = document.getElementById("launch-btn");
    launchBtn.style.visibility = selectStatusConditionRef.value === "Accepted" ? "visible" : "hidden";
};


















// ------------------------------  LANCEMENT création de la base de donnée ------------------------------










let dbName = `MSS_db`,
    activityStoreName = "ActivityList",
    profilStoreName = "Profil",
    rewardsStoreName = "Recompenses",
    specialRewardsStoreName = "Special-Recompense",
    settingStoreName = "Setting",
    templateStoreName = "Template",
    favorisStoreName = "Favoris",
    templateSessionStoreName = "TemplateSession",
    planningStoreName ="Planning";
    









//--------------------------------- BOUTON FLOTTANT ---------------------------



const btnNewActivityRef = document.getElementById('btnNewActivity');
const btnNewFromTemplateRef = document.getElementById("btnNewFromTemplate");
let lastScrollTop = 0;
let scrollTimeout;


// Écoute de l'événement scroll sur la div
divItemListRef.addEventListener('scroll', () => {
    // Cache le bouton dès qu'il y a un mouvement de scroll
    btnNewActivityRef.classList.add('hidden');
    btnNewFromTemplateRef.classList.add('hidden');

    // Empêche le bouton de réapparaître immédiatement
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        btnNewActivityRef.classList.remove('hidden');
        btnNewFromTemplateRef.classList.remove('hidden');
    }, 200); // Réapparaît après 200ms une fois le scroll arrêté
});

 






// ----------------------------- gestion PERSISTANCE DATA BASE --------------------------------------------



//   Base persistante ?
async function checkIfPersistent() {
    if (navigator.storage && navigator.storage.persisted) {
      const isPersisted = await navigator.storage.persisted();
      console.log(`Le stockage est ${isPersisted ? "persistant" : "volatil"}.`);

        //   Si ne l'est pas, demande à l'utilisateur
        if (!isPersisted) {
            console.log("Base non persistante. Demande à l'utilisateur");
            requestPersistentStorage();
        }

    } else {
      console.warn("L'API StorageManager n'est pas disponible.");
    }
}
  
  // Vérifie si le stockage est persistant
  checkIfPersistent();



// Fonction de demande de persistance
async function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
        if (isPersisted) {
            console.log("Le stockage est maintenant persistant.");
        } else {
            console.log("Impossible de rendre le stockage persistant.");
        }
    } else {
      console.warn("L'API StorageManager n'est pas disponible.");
    }
}
  

// -----------------------------------  pouch DB -------------------------------------





// Créer (ou ouvrir si elle existe déjà) une base de données PouchDB
let  db = new PouchDB(dbName, { auto_compaction: true });//avec la suppression automatique des anciennes révisions

// Vérifier si la base est bien créée
db.info().then(info => console.log(' [DATABASE] Base créée/ouverte :', info));



// Création des éléments de base
async function onCreateDBStore() {
    async function createStore(storeId, data) {
        try {
            let existing;
            try {
                existing = await db.get(storeId);
            } catch (err) {
                if (err.status !== 404) { // Si ce n'est pas une erreur "document non trouvé", on affiche l'erreur
                    console.error(`[DATABASE] Erreur lors de la vérification du store ${storeId}:`, err);
                    return;
                }
                existing = null;
            }

            if (!existing) {
                await db.put({ _id: storeId, ...data });
                console.log(`[DATABASE] Création du store ${storeId.toUpperCase()}`);
            } else {
                console.log(`[DATABASE] Le store ${storeId.toUpperCase()} existe déjà`);
            }
        } catch (err) {
            console.error(`[DATABASE] Erreur lors de la création du store ${storeId}:`, err);
        }
    }

    // Création des stores
    await createStore(favorisStoreName, { type: favorisStoreName, favorisList: [] });
    await createStore(profilStoreName, { 
        type: profilStoreName,
        data:{
            pseudo: "", 
            customNotes: "",
            conditionAccepted : false 
        }
    });
    await createStore(settingStoreName, {
        type: settingStoreName,
        data:{
            agenda : "NONE",
            agendaScheduleStart:"08:00",
            agendaScheduleEnd:"10:00",
            displayCommentDoneMode: "Collapse",
            displayCommentPlannedMode: "Collapse",
            isAutoSaveEnabled: false,
            lastAutoSaveDate: "noSet",
            lastAutoSaveTime: "",
            lastManualSaveDate: "noSet",
            lastManualSaveTime: "",
            autoSaveFrequency: 7,
            fromSessionToActivityMode : "MINIMAL",
            devMode:false,
            animationEnabled : true
        }  
    });
    await createStore(rewardsStoreName, { type: rewardsStoreName, rewards: [] });

    await createStore(specialRewardsStoreName, { type: specialRewardsStoreName, specialRewards: [] });
    
    await createStore(planningStoreName, { type: planningStoreName, userPlanning : defaultPlanningArray});

}






// Fonction pour récupérer les données des stores
async function onLoadStores() {
    try {
        const profil = await db.get(profilStoreName).catch(() => null);
        if (profil) {
            userInfo.pseudo = profil.data.pseudo;
            userInfo.customNotes = profil.data.customNotes;
            userInfo.conditionAccepted = profil.data.conditionAccepted;
        }

        const rewards = await db.get(rewardsStoreName).catch(() => null);
        if (rewards) {
            userRewardsArray = rewards.rewards;
        }

        const specialRewards = await db.get(specialRewardsStoreName).catch(() => null);
        if (specialRewards) {
            userSpecialRewardsArray = specialRewards.specialRewards;
        }

        const favoris = await db.get(favorisStoreName).catch(() => null);
        if (favoris) {
            userFavoris = favoris.favorisList;
        }

        const settings = await db.get(settingStoreName).catch(() => null);
        if (settings) {

            userSetting = {
                agenda : settings.data.agenda || defaultSetting.agenda,
                agendaScheduleStart: settings.data.agendaScheduleStart || defaultSetting.agendaScheduleStart,
                agendaScheduleEnd: settings.data.agendaScheduleEnd || defaultSetting.agendaScheduleEnd,
                displayCommentDoneMode : settings.data.displayCommentDoneMode || defaultSetting.displayCommentDoneMode,
                displayCommentPlannedMode : settings.data.displayCommentPlannedMode || defaultSetting.displayCommentPlannedMode,
                isAutoSaveEnabled : settings.data.isAutoSaveEnabled ?? defaultSetting.isAutoSaveEnabled,
                lastAutoSaveDate : settings.data.lastAutoSaveDate || defaultSetting.lastAutoSaveDate,
                lastAutoSaveTime : settings.data.lastAutoSaveTime || defaultSetting.lastAutoSaveTime,
                lastManualSaveDate : settings.data.lastManualSaveDate || defaultSetting.lastManualSaveDate,
                lastManualSaveTime :settings.data.lastManualSaveTime || defaultSetting.lastManualSaveTime,
                autoSaveFrequency : settings.data.autoSaveFrequency || defaultSetting.autoSaveFrequency,
                fromSessionToActivityMode : settings.data.fromSessionToActivityMode || defaultSetting.fromSessionToActivityMode,
                devMode : settings.data.devMode ?? defaultSetting.devMode,
                animationEnabled: settings.data.animationEnabled ?? defaultSetting.animationEnabled
            };
        }

        if (devMode === true){console.log("[DATABASE] Données chargées :", { userInfo, userRewardsArray, userFavoris, userSetting });};
    } catch (err) {
        console.error("[DATABASE] Erreur lors du chargement des stores :", err);
    }
}







// Procésus de lancement de l'application
async function initApp() {
    await onCreateDBStore();  // 1️⃣ Création des stores
    await onLoadStores();       // 2️⃣ Extraction des données des stores génériques
    await onLoadActivityFromDB(); // 3️⃣Extraction liste activité

    await onLoadTemplateFromDB(); // Extraction liste modèle
    onUpdateTemplateKeys();//récupère les clés des modèles d'activités triés
}


// Appel de la fonction après l'initialisation
initApp().then(() => firstActualisation());

async function firstActualisation() {
    // Set le devMode

    devMode = userSetting.devMode;

    if (devMode === true){console.log("Première actualisation")};


    // CONDITION UTILISATION
    if (userInfo.conditionAccepted === false) {
        onGenerateConditionUtilisation();
    }
    console.log("userInfo.ConditionAccepted : " + userInfo.conditionAccepted );

    // FAVORIS
    onGenerateActivityOptionChoice("selectorCategoryChoice");
    onGenerateFakeOptionList("divFakeSelectOptList");


    // SETTING
    // Met à jour les css du mode d'affichage selon les paramètres
    currentCommentDoneClassName = onSearchCommentClassNameByMode(userSetting.displayCommentDoneMode);
    currentCommentPlannedClassName = onSearchCommentClassNameByMode(userSetting.displayCommentPlannedMode);


    // Traitement sauvegarde automatique
    if (userSetting.isAutoSaveEnabled) {
        console.log("[SETTING] Autosave activée.");
        if (devMode === true){console.log("[SETTING] Autosave activité. Demande de vérification des conditions");};

        // Vérification des conditions
        let isSaveRequired = await onCheckAutoSaveCondition();
        console.log("Sauvegarde Automatique nécessaire :", isSaveRequired);

        if (isSaveRequired) {
            eventSaveData(true);
        }

    }


    // ACTIVITY

    if (devMode === true) {
        console.log("Loading allUserActivityArray :",allUserActivityArray);
    };
    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Actualisation de l'affichage des activités
    eventUpdateActivityList();

    // TEMPLATE
    onUpdateTemplateList(false);

}