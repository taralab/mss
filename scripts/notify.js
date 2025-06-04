
// Tableau des notifications

let notifyTextArray = {
    delete : {emoji : "🗑️",text: "Activité supprimée !"},
    creation : {emoji : "👌",text: "Activité créée !"},
    modification : {emoji : "🛠️",text: "Activité modifiée !"},
    saveprofil : {emoji : "👤",text: "Profil sauvegardé !"},
    exportSuccess : {emoji : "🗂️",text: "Données exportées !"},
    importSuccess : {emoji : "🗂️",text: "Données importées"},
    saveSetting : {emoji : "🛠️",text: "Paramètres modifiés !"},
    templateCreation :{emoji : "👌",text: "Modèle créé !"},
    templateModification : {emoji : "🛠️",text: "Modèle modifié !"},
    templateDeleted : {emoji : "🗑️",text: "Modèle supprimé !"},
    counterCreated : {emoji : "👌",text: "Compteur créé !"},
    counterDeleted : {emoji : "🗑️",text: "Compteur supprimé !"},
    counterTargetReach : {emoji : "💪",text: "Compteur validé !"},
    sessionReset : {emoji : "🔄",text: "Session réinitialisée !"},
    activityGenerated : {emoji : "👌",text: "Activité généré !"},
    inputIncrementEmpty : {emoji : "❗",text: "Valeur manquante !"},
    planningModified : {emoji :"🛠️" ,text: "Planning modifié !"}
};





let animationDuration = 1000;//durée de l'animation

// Popup de notification 
function onShowNotifyPopup(key) {
    let divPopup = document.getElementById("popupNotify");

    //emojie
    let popupImgRef = document.getElementById("divNotifyPopupEmoji");
    popupImgRef.innerHTML = notifyTextArray[key].emoji;

    // Texte
    let popupTextRef = document.getElementById("spanPopupNotifyText");
    popupTextRef.innerHTML = notifyTextArray[key].text;

    divPopup.classList.add('show');
    setTimeout(() => {
        divPopup.classList.remove('show');
    }, animationDuration); // Cache le popup après 3 secondes
};







// -------------------------------------- MOBILE NOTIFICATION -------------------------------------------------------



// Gestion des éléments DOM
let pMobileNotifyStatusRef = document.getElementById("pMobileNotifyStatus"),
    rewardsKeyArrayToNotifyCue = [],//tableau vidé par la boucle de notification au fur et à mesure
    isMobileNotifyInProgress = false; // pour ne pas lancer la boucle en doublon si traitement en cours

// Vérifie si le navigateur supporte les notifications
const isNotificationSupported = () => 'Notification' in window;







// Demande l'autorisation pour les notifications
const requestNotificationPermission = async () => {

    if (devMode === true){console.log(" [NOTIFY] [MOBILE] : demande d'autorisation");};

    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        localStorage.setItem('MSS_notifyPermission', permission); // Mémorise la décision
        if (devMode === true){console.log(" [NOTIFY] [MOBILE] : enregistrement de la décision " + permission);};
        updateStatusDisplay();
        return permission;
    }
    return Notification.permission;
};


// fonction d'envoie une notification
function sendRewardMobileNotify(title, body) {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(swRegistration => {
            swRegistration.showNotification(title, {
                badge :"./Icons/notifyBadge48.png",
                icon: "./Icons/notifyRewardsColor192.png",
                body: body,
                vibrate: [200, 100, 200],
            });
        });
    }
};


function onReceiveNotifyMobileEvent(rewardsKeysArray) {
    if (Notification.permission === 'granted') {
        
        // Ajout des nouvelles notifications dans la file d'attente
        rewardsKeyArrayToNotifyCue.push(...rewardsKeysArray);

        // Ne lance la boucle de traitement que si elle n'est pas encours
        // Car sinon juste le fait d'alimenter l'arret ci-dessus suffit à la faire continuer son traitement
        if (!isMobileNotifyInProgress) {
            // Lancement de la boucle de traitement
            if (devMode === true){console.log(" [NOTIFY] [MOBILE] Lancement de la boucle de traitement. Activation du boolean");};
            isMobileNotifyInProgress = true;
            onTraiteMobileNotify(); 
        }
        

    } else if (Notification.permission === 'denied') {
        if (devMode === true){console.log(" [NOTIFY] [MOBILE] Notification NON autorisées ! ");};
        return
    } else{
        eventFirstMobileNotify(rewardsKeysArray);
    }
};



// première notification mobile
const eventFirstMobileNotify = async (rewardsKeysArray) => {

    if (devMode === true){console.log(" [NOTIFY] [MOBILE] première notication.");};

    // Première récompense
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
        // Ajout des nouvelles notifications dans la file d'attente
        rewardsKeyArrayToNotifyCue.push(...rewardsKeysArray);
        if (devMode === true){console.log(" [NOTIFY] [MOBILE] Lancement de la boucle de traitement. Activation du boolean");};
        isMobileNotifyInProgress = true;
        onTraiteMobileNotify();
    }
};



//Boucle de traitement des notifications mobiles REWARDS
function onTraiteMobileNotify() {
    // index zero de la file d'attente
    let rewardKey = rewardsKeyArrayToNotifyCue[0];



    //Je m'assure que le reward existe dans un des deux objets
    if (Object.keys(allRewardsObject).includes(rewardKey) || Object.keys(allSpecialEventsRewardsObject).includes(rewardKey)){
        if (devMode === true){console.log("[NOTIFY] [MOBILE] [REWARD] reward existant");};
    }else{
        console.error("ERREUR REWARDS : ",rewardKey);
        return
    }

    // Recherche dans quel objet se trouve la récompense (standard ou spécial)
    let isStandartReward = Object.keys(allRewardsObject).includes(rewardKey);
    if (isStandartReward) {
        sendRewardMobileNotify(allRewardsObject[rewardKey].activityName, allRewardsObject[rewardKey].title);
    }else{
        sendRewardMobileNotify("⭐ SPECIAL EVENT ⭐", allSpecialEventsRewardsObject[rewardKey].title);
    };

    
    // Retire l'index zero de la file d'attente
    rewardsKeyArrayToNotifyCue.shift();

    if (devMode === true){
        console.log("[NOTIFY] [MOBILE] Traitement pour " + rewardKey);
        console.log("[NOTIFY] [MOBILE] File d'attente :" + rewardsKeyArrayToNotifyCue);
    };
    

    setTimeout(() => {
        if (rewardsKeyArrayToNotifyCue.length > 0) {            
            onTraiteMobileNotify();
        } else {
            if (devMode === true){console.log("[NOTIFY] [MOBILE] fin de traitement. Libération du boolean");};
            isMobileNotifyInProgress = false;
        }
    }, 2000);
}



// Verification des notifications mobile au démarrage
function onInitMobileNotify() {
    if (devMode === true){console.log("[NOTIFY] [MOBILE] Initialisation du statut");};
    if (!isNotificationSupported()) {
        pMobileNotifyStatusRef.innerHTML = 'Notifications : Non supportées par ce navigateur';
        return;
    }

    // Vérifie l'état actuel et met à jour l'affichage
    const savedPermission = localStorage.getItem('MSS_notifyPermission');
    if (savedPermission) {
        Notification.permission = savedPermission; // Pour l'affichage uniquement
    }
    if (devMode === true){console.log("[NOTIFY] [MOBILE] valeur enregistrée : " + savedPermission);};
    updateStatusDisplay();

};


// Met à jour l'état affiché à l'utilisateur
function updateStatusDisplay (){
    const permission = Notification.permission;
    if (devMode === true){console.log("[NOTIFY] [MOBILE] valeur Notification.permission : " + permission);};

    if (permission === 'granted') {
        pMobileNotifyStatusRef.innerHTML = 'Activées';
    } else if (permission === 'denied') {
        pMobileNotifyStatusRef.innerHTML = 'Refusées';
    } else {
        pMobileNotifyStatusRef.innerHTML = 'Non configurées';
    }
};






// * *  *   *   *   *   * ICS   *   *   **  *   *   *   *   







function onClickAddToCalendar(keyRef) {
    let activityTarget = allUserActivityArray[keyRef];

    switch (userSetting.agenda) {
        case "NONE":
            alert("Veuillez sélectionner un agenda dans 'Paramètres.'");
            break;
        case "GOOGLE":
            let urlGoogle = generateGoogleCalendarLink(activityTarget);
            window.open(urlGoogle, "_blank"); 
            break;
        case "OUTLOOK":
            let urlOutlook = generateOutlookCalendarLink(activityTarget);
            window.open(urlOutlook,"_blank");
            break;
    
        default:
            break;
    }

}







// GENERATION GOOGLE URL
function generateGoogleCalendarLink(activityTarget) {

    let title = activityChoiceArray[activityTarget.name].displayName,
        description = activityTarget.comment,
        location = activityTarget.location,
        dateFormated = activityTarget.date.replaceAll("-","");
        scheduleStartFormated = userSetting.agendaScheduleStart.replaceAll(":","");
        scheduleEndFormated = userSetting.agendaScheduleEnd.replaceAll(":","");

    description = description + "<br> <br>Mon Suivi Sportif.";//signature

    let dateStart = `${dateFormated}T${scheduleStartFormated}00`,
        dateEnd = `${dateFormated}T${scheduleEndFormated}00`;

    


    return `https://calendar.google.com/calendar/render?action=TEMPLATE` +
           `&text=${encodeURIComponent(title)}` +
           `&details=${encodeURIComponent(description)}` +
           `&location=${encodeURIComponent(location)}` +
           `&dates=${dateStart}/${dateEnd}` +
           `&trp=true`;
}



// GENERATION OUtLOOK URL
function generateOutlookCalendarLink(activityTarget) {

    let title = activityChoiceArray[activityTarget.name].displayName,
        description = convertLineBreaksForOutlook(activityTarget.comment),
        location = activityTarget.location;

    description = description + "<br> <br>Mon Suivi Sportif.";//signature

    let dateStart = `${activityTarget.date}T${userSetting.agendaScheduleStart}:00`,
        dateEnd = `${activityTarget.date}T${userSetting.agendaScheduleEnd}:00`;


    return `https://outlook.live.com/calendar/0/deeplink/compose?` +
           `subject=${encodeURIComponent(title)}` +
           `&body=${encodeURIComponent(description)}` +
           `&location=${encodeURIComponent(location)}` +
           `&startdt=${dateStart}` +
           `&enddt=${dateEnd}` +
           `&allday=false`;
}



function convertLineBreaksForOutlook(description) {
    return description.replace(/\n/g, "<br>"); // Remplace les retours à la ligne par %0D%0A
}






onInitMobileNotify();
