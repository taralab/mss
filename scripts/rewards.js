
// Les trophes possédés par l'utilisateur
let userRewardsArray = [],
    rewardsEligibleArray = [], //stockes les trophés auxquels l'utilisateur est éligible 
    newRewardsToSee = [],//les nouveaux trophé obtenu. Vidé lorsque l'utilisateur quitte le menu récompense
    rewardAllActivityNonPlannedKeys = [], // tableau qui contient les clé des activités non planifiées
    currentRewardOnFullScreen = "";


// Reference 
let imgRewardsFullScreenRef,
pRewardsFullScreenTitleRef,
pRewardsFullScreenTextRef,
divRewardsListRef;








// ---------------------------------------- BDD -------------------------------------------








// ----------------------------------   Fonction génériques-------------------------------





// Nombre d'activité pour une activité désigné
function onSearchActivityCountValue(data,activityTarget,countTarget){
    let allActivityTargetFound = data.filter(e=>{
        // Recupère toutes les d'activités concernés
        return e.name === activityTarget;
    });
    // Retour true ou false si le nombre désiré est atteind
    return allActivityTargetFound.length === countTarget;
};



// DISTANCE CUMULE pour un type d'activité. Est-ce que c'est dans la fourchette ? 
function onSearchActivitiesTotalDistanceRange(filteredKeys, bottomValue, topValue) {

    if (devMode === true) {
        console.log(`[REWARDS] recherche Distances cumulées Range entre : ${bottomValue} et ${topValue}`);
    }

    const totalDistance = filteredKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.distance) {
            return sum + parseFloat(activity.distance || 0);
        }
        return sum;
    }, 0);

    if (devMode === true) {
        console.log("Valeur totale distance = " + totalDistance);
    }

    return totalDistance >= bottomValue && totalDistance <= topValue;
}




// DISTANCE CUMULE pour un type d'activité. Est-ce que c'est supérieure ? 
function onSearchActivitiesTotalDistanceSuperior(dataKeys, targetValue) {

    if (devMode === true) {
        console.log(`[REWARDS] recherche Distances cumulées supérieures à : ${targetValue}`);
    }

    const totalDistance = dataKeys.reduce((sum, key) => {
        const activity = allUserActivityArray[key];
        if (activity && activity.distance) {
            return sum + parseFloat(activity.distance);
        }
        return sum;
    }, 0);

    if (devMode === true) {
        console.log("Valeur totale distance = " + totalDistance);
    }

    return totalDistance >= targetValue;
}


// DISTANCE UNIQUE d'une activité spécifique. Est-ce que c'est dans la fourchette ? 
function onSearchActivityWithDistanceRange(dataKeys, bottomTarget, topTarget) {
    if (devMode === true){console.log(`[REWARDS] recherche d'une distance unique comprise entre : ${bottomTarget} et ${topTarget}`);};
    let targetFound = false;

    for (let e of dataKeys){
        if (devMode === true){console.log(Number(allUserActivityArray[e].distance));};
        if (Number(allUserActivityArray[e].distance) >= bottomTarget  && Number(allUserActivityArray[e].distance) <= topTarget) {
            targetFound = true;
            break;  
        };
    };

    return targetFound;
}



// DISTANCE UNIQUE d'une activité spécifique. Est-ce que c'est supérieur ? 
function onSearchActivityWithDistanceSuperior(dataKeys,targetValue) {

    if (devMode === true){console.log(`[REWARDS] recherche d'une distance unique supérieures à : ${targetValue}`);};
    let targetFound = false;

    for (let e of dataKeys){
        if (devMode === true){console.log(Number(allUserActivityArray[e].distance));};
        if (Number(allUserActivityArray[e].distance) >= targetValue) {
            targetFound = true;
            break;
        };
    };

    return targetFound;
}




// Fonction de recherche du nombre d'activité différentes
function onSearchVariousActivitiesNumber(allDataKeys,targetValue,currentActivity) {
    if (devMode === true){console.log(`[REWARDS] Recheche d'activite de type different. Nombre cible : ${targetValue} et activite en cours : ${currentActivity}`);};


    let allTypeActivityList = [];

    // Insertion de l'activité en cours dans la liste
    if (!allTypeActivityList.includes(currentActivity)) {
        allTypeActivityList.push(currentActivity);
    }

    // Recupère les catégories d'activités différentes
    for (let e of allDataKeys){
        if (!allTypeActivityList.includes(allUserActivityArray[e].name))  {
            allTypeActivityList.push(allUserActivityArray[e].name);
        };
        // Fin de traitement dès condition atteinte
        if (allTypeActivityList.length >= targetValue) {
            if (devMode === true){console.log(`[REWARDS] Cible atteinte. Interromp le traitement`);};
            break;
        };
    };
        

    if (devMode === true){
        console.log("[REWARDS] [GENERAL] de allTypeActivityList = " );
        console.log("Nombre d'activité différente : " + allTypeActivityList.length);
        console.log(allTypeActivityList);
    };

    return allTypeActivityList.length >= targetValue;
};











// ----------------------------------------- Ouverture menu récompense ------------------------------






function onOpenMenuRewards(){
    if (devMode === true){console.log("[REWARDS] Ouverture menu Rewards");};

    // Reference les éléments
    imgRewardsFullScreenRef = document.getElementById("imgRewardsFullScreen");
    pRewardsFullScreenTextRef = document.getElementById("pRewardsFullScreenText");
    pRewardsFullScreenTitleRef = document.getElementById("pRewardsFullScreenTitle");
    divRewardsListRef = document.getElementById("divRewardsList");


    // Prend les récompenses de l'utilisateur pour les afficher dans la liste
    onLoadUserRewardsList();
    


};



// Creation des récompenses de l'user dans la liste
function onLoadUserRewardsList() {

    divRewardsListRef.innerHTML = "";

    if (devMode === true){console.log("[REWARDS] Création de la liste des récompenses");};

    // Les Rewards que possède déjà l'utilisateur 

    userRewardsArray.sort();


    userRewardsArray.forEach(e=>{

        // la div contenant un reward
        let newDivRewardCard = document.createElement("div");
        newDivRewardCard.onclick = function (event) {
            // si c'est un new reward, enleve la class newRewards lorsque clique dessus
            if (event.currentTarget.classList.contains("newRewards")) {
                event.currentTarget.classList.remove("newRewards");
            }


            // affiche en plein écran
            onDisplayRewardsFullScreen(e);
        };

        // Ajouter des classes de base
        newDivRewardCard.classList.add("reward-card", "unlocked");

        // Ajouter une classe supplémentaire si c'est un nouveau reward
        if (newRewardsToSee.includes(e)) {
            newDivRewardCard.classList.add("newRewards");
        }


        // IMAGES
        let newImg = document.createElement("img");
  
        newImg.classList.add("rewardCardEnable");
        newImg.src = allRewardsObject[e].imgRef;
        newImg.loading = "lazy";



        // TEXT

        let newPRewardTitle = document.createElement("p");
        newPRewardTitle.classList.add("reward-title");
        newPRewardTitle.innerHTML = allRewardsObject[e].title;

        // Insertion

        newDivRewardCard.appendChild(newImg);
        newDivRewardCard.appendChild(newPRewardTitle);
        // newDivRewardCard.appendChild(newPRewardCondition);


        divRewardsListRef.appendChild(newDivRewardCard);
    });



    // le reste des rewards non possédé
    let allRewardsKeys = Object.keys(allRewardsObject);
    // Récupère les clés pour les classé ordre alpha
    allRewardsKeys.sort();

    allRewardsKeys.forEach(key=>{

        let isPossessed = userRewardsArray.includes(key);

        if (!isPossessed) {
            // la div contenant un reward
            let newDivRewardCard = document.createElement("div");
            newDivRewardCard.classList.add("reward-card", "locked");
            newDivRewardCard.onclick = function (){
                onClickRewardLocked(this);
            };


            // Création des images
            let newImg = document.createElement("img");
            newImg.classList.add("rewardCardDisable");
            newImg.src = "./Icons/badge-locked.webp";
            newImg.loading = "lazy";

            // TEXT
            let newPRewardTitle = document.createElement("p");
            newPRewardTitle.classList.add("reward-title");
            newPRewardTitle.innerHTML = allRewardsObject[key].title;

            let newPRewardCondition = document.createElement("p");
            newPRewardCondition.classList.add("reward-condition");
            newPRewardCondition.innerHTML = allRewardsObject[key].text;



            // Insertion
            newDivRewardCard.appendChild(newImg);
            newDivRewardCard.appendChild(newPRewardTitle);
            newDivRewardCard.appendChild(newPRewardCondition);

            divRewardsListRef.appendChild(newDivRewardCard);
        }

    });

};




// ---------------------------------------- VISUALISATION   GROS PLAN    --------------------------------





// Affiche en grand la récompense
function onDisplayRewardsFullScreen(rewardName) {
    if (devMode === true){console.log("[REWARDS]  demande de visualisation de récompense : " + rewardName);};
    currentRewardOnFullScreen = rewardName;

    // set les éléments et affiche
        imgRewardsFullScreenRef.src = allRewardsObject[rewardName].imgRef;

        pRewardsFullScreenTitleRef.innerHTML = allRewardsObject[rewardName].title;

        pRewardsFullScreenTextRef.innerHTML = `Tu as pratiqué ${allRewardsObject[rewardName].text}.`;

    document.getElementById("divFullScreenRewards").classList.add("show");

};


// Masque la récompense qui était en grand plan
function onHiddenFullscreenRewards() {
    if (devMode === true){console.log("cache la div de visualisation de récompense");};
    document.getElementById("divFullScreenRewards").classList.remove("show");
};



// récompense verrouillé

function onClickRewardLocked(itemRef) {
    // Ajout de l'effet de tremblement
    itemRef.classList.add('tremble');

    // Suppression de l'effet après l'animation
    setTimeout(() => {
        itemRef.classList.remove('tremble');
    }, 400);
}



// ----------------------------   PARTAGE IMAGES  --------------------------------







async function shareImage(event) {
    event.stopPropagation();

    if (devMode === true){console.log("[REWARDS] demande de partage d'image");};


    const canvas = document.getElementById('canvasCreateShareImg');
    const ctx = canvas.getContext('2d');

    // Charger l'image de fond (600x800 avec le logo en bas)
    const background = new Image();
    background.src = "./Icons/RewardShareBackground.webp"; // image de fond
    

    // Charger l'image principale (512x512)
    const mainImage = new Image();
    mainImage.src = allRewardsObject[currentRewardOnFullScreen].imgRef; // Image du reward
    
    background.onload = function() {
        canvas.width = 600; // Largeur fixe
        canvas.height = 800; // Hauteur fixe

        // Dessiner l'image de fond
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        mainImage.onload = function() {
            // Position de l'image principale (centrée en haut)
            const xPos = (canvas.width - 512) / 2;
            const yPos = 60; // place pour le titre

            // Dessiner l'image principale
            ctx.drawImage(mainImage, xPos, yPos, 512, 512);

            // Le PSEUDO en haut
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = "#004a9f"; // Couleur du texte
            ctx.textAlign = "center"; // Centrer le texte
            ctx.fillText(userInfo.pseudo, canvas.width / 2, 50); // Position du texte

            // La description sous l'image
            ctx.font = "italic 22px Arial, sans-serif";
            ctx.fillStyle = "#004a9f";
            ctx.fillText(`A pratiqué ${allRewardsObject[currentRewardOnFullScreen].text}.`, canvas.width / 2, yPos + 550); // Juste sous l'image

            // Convertir le canvas en fichier et partager
            canvas.toBlob(blob => {
                const file = new File([blob], "image_finale.png", { type: "image/png" });

                if (navigator.share) {
                    navigator.share({
                        files: [file],
                        title: "Récompense obtenue",
                        text: "Matte ça !",
                    })
                    .then(() => console.log('Image partagée avec succès !'))
                    .catch(error => console.error('Erreur de partage : ', error));
                } else {
                    alert("L'API Web Share n'est pas supportée sur ce navigateur.");
                }
            }, "image/png");
        };
    };
}




// ---------------------------------    OBTENTION-------------------------------------






function onCheckReward(currentActivitySavedName) {

    onInitRewardsVariable();

    onSearchGeneralRewards(currentActivitySavedName);


    //Traitement des 1 ans
    onCheckOneYearEligible(rewardAllActivityNonPlannedKeys);


    //Traitement "de retour"
    onCheckDeRetour(rewardAllActivityNonPlannedKeys);



    // Récupère uniquement les données concernant l'activité en question et non planifié
    let specificActivitiesKeys = Object.entries(allUserActivityArray)
        .filter(([key, value]) => value.name === currentActivitySavedName && value.isPlanned === false)
        .map(([key, value]) => key);


    onSearchSpecifyRewards(currentActivitySavedName,specificActivitiesKeys);



    // Traite les trophés définitifs à affecter à l'utilisateur
    onAffectFinalRewardsToUser();
}



function onInitRewardsVariable() {
    // Reset la variable
    rewardsEligibleArray = [];
    rewardAllActivityNonPlannedKeys = [];

    //filtre sur les clées des activités accomplits
    rewardAllActivityNonPlannedKeys = Object.entries(allUserActivityArray)
        .filter(([key, value]) => value.isPlanned === false)
        .map(([key, value]) => key);

    if (devMode === true){
        console.log("[REWARDS] retrait des activité planifié")
        console.log("Nbre activité retiré = " + (allUserActivityArray.length - rewardAllActivityNonPlannedKeys.length));
    ;};
}

// Recherche d'éligibilité aux trophés communs
function onSearchGeneralRewards(activityTarget) {

    let activityArrayLength = rewardAllActivityNonPlannedKeys.length;


    // Traitement des récompenses génériques
    if (devMode === true){console.log("[REWARDS] Traitement des récompenses génériques");};


    // POLYVALENT (5 activités différentes)
    if (!userRewardsArray.includes("POLYVALENT")) {
        if (devMode === true){console.log("[REWARDS] [GENERIQUE] Test eligibilité pour : POLYVALENT");};
        let isEligible = onSearchVariousActivitiesNumber(rewardAllActivityNonPlannedKeys,5,activityTarget);
        if (isEligible) {
            rewardsEligibleArray.push("POLYVALENT");
        }
        if (devMode === true){console.log("[REWARDS] [GENERIQUE] POLYVALENT Resultat : " + isEligible);};
    }


    // ACTIVITE-FIRST 1re activité tout confondu
    if (!userRewardsArray.includes("ACTIVITE-FIRST")) {
        if (devMode === true){console.log("[REWARDS] [GENERIQUE] Test eligibilité pour : ACTIVITE-FIRST");};
            let isEligible = activityArrayLength >= 1;//car il faut traiter si les gens l'ont utilisé avant la mise à jours
        if (isEligible) {
            rewardsEligibleArray.push("ACTIVITE-FIRST");
        }
        if (devMode === true){console.log("[REWARDS] [GENERIQUE] ACTIVITE-FIRST Resultat : " + isEligible);};
    }

    // 100 ieme activité tout confondu
    if (!userRewardsArray.includes("ACTIVITE-100")) {
        if (devMode === true){console.log("[REWARDS] [GENERIQUE] Test eligibilité pour : ACTIVITE-100");};
            let isEligible = activityArrayLength >= 100;//car il faut traiter si les gens l'ont utilisé avant la mise à jours
        if (isEligible) {
            rewardsEligibleArray.push("ACTIVITE-100");
        }
        if (devMode === true){console.log("[REWARDS] [GENERIQUE] ACTIVITE-100 Resultat : " + isEligible);};
    }

}


//test des 1 ans
function onCheckOneYearEligible(activityKeys) {

    // Met fin à la fonction si dispose déjà du rewards
    if (userRewardsArray.includes("1-AN")){
        return
    }

    if (!activityKeys || activityKeys.length < 2) {
        return false; // Pas assez d'activités pour comparer
    }

    const dates = activityKeys
        .map(key => {
            const activity = allUserActivityArray[key];
            return activity?.date ? new Date(activity.date) : null;
        })
        .filter(date => date instanceof Date && !isNaN(date)); // On garde les dates valides

    if (dates.length < 2) {
        return false; // Toujours pas assez de dates valides
    }

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    const diffInMs = maxDate - minDate;

    let isEligible = diffInMs >= oneYearInMs;
    if (isEligible) {
        rewardsEligibleArray.push("1-AN");
    }
    if (devMode === true){console.log(`[REWARDS] [COMMUN]  : 1-AN resultat : ` + isEligible);};   

}

//De retour
function onCheckDeRetour(activityKeys) {
    if (userRewardsArray.includes("DE-RETOUR")) {
        if (devMode === true){console.log(`[REWARDS] [COMMUN]  : dispose déjà : DE-RETOUR`);};
        return
    }   
    if (!activityKeys || activityKeys.length < 2) {
        return false;
    }

    const dates = activityKeys
        .map(key => {
            const activity = allUserActivityArray[key];
            return activity?.date ? new Date(activity.date) : null;
        })
        .filter(date => date instanceof Date && !isNaN(date))
        .sort((a, b) => a - b); // Tri des dates dans l'ordre chronologique

    for (let i = 1; i < dates.length; i++) {
        const diffInMs = dates[i] - dates[i - 1];
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        if (diffInDays > 30) {
            rewardsEligibleArray.push("DE-RETOUR");
            if (devMode === true){console.log(`[REWARDS] [COMMUN]  : DE-RETOUR resultat : Eligible`)};   
            return true;
        }
    }

    return false;
}




// Traitement des récompenses spécitique à l'activité créée ou modifiée
function onSearchSpecifyRewards(activityTargetName,filteredKeys) {


    switch (activityTargetName) {
        case "C-A-P":
            onTraiteRewardsBasicPalier(filteredKeys,"CAP-A-1-SEANCE","CAP-B-10-SEANCES","CAP-C-50-SEANCES","CAP-D-100-SEANCES");
            onTraiteRewardsSpecificCAP(filteredKeys);
            break;
        case "VELO":
            onTraiteRewardsBasicPalier(filteredKeys,"VELO-A-1-SEANCE","VELO-B-10-SEANCES","VELO-C-50-SEANCES","VELO-D-100-SEANCES");
            onTraiteRewardsSpecificVELO(filteredKeys);
            break;
        case "FRACTIONNE":
            onTraiteRewardsBasicPalier(filteredKeys,"FRACTIONNE-A-1-SEANCE","FRACTIONNE-B-10-SEANCES","FRACTIONNE-C-50-SEANCES","FRACTIONNE-D-100-SEANCES");
            break;
        case "MARCHE-RANDO":
            onTraiteRewardsBasicPalier(filteredKeys,"MARCHE-RANDO-A-1-SEANCE","MARCHE-RANDO-B-10-SEANCES","MARCHE-RANDO-C-50-SEANCES","MARCHE-RANDO-D-100-SEANCES");
            onTraiteRewardsSpecificMARCHE(filteredKeys);
            break;
        case "NATATION":
            onTraiteRewardsBasicPalier(filteredKeys,"NATATION-A-1-SEANCE","NATATION-B-10-SEANCES","NATATION-C-50-SEANCES","NATATION-D-100-SEANCES");
            onTraiteRewardsSpecificNATATION(filteredKeys);
            break;
        case "CROSSFIT":
            onTraiteRewardsBasicPalier(filteredKeys,"CROSSFIT-A-1-SEANCE","CROSSFIT-B-10-SEANCES","CROSSFIT-C-50-SEANCES","CROSSFIT-D-100-SEANCES");
            break;
        case "YOGA":
            onTraiteRewardsBasicPalier(filteredKeys,"YOGA-A-1-SEANCE","YOGA-B-10-SEANCES","YOGA-C-50-SEANCES","YOGA-D-100-SEANCES");
            break;
        case "SPORT-CO":
            onTraiteRewardsBasicPalier(filteredKeys,"SPORT-CO-A-1-SEANCE","SPORT-CO-B-10-SEANCES","SPORT-CO-C-50-SEANCES","SPORT-CO-D-100-SEANCES");
            break;
        case "ESCALADE":
            onTraiteRewardsBasicPalier(filteredKeys,"ESCALADE-A-1-SEANCE","ESCALADE-B-10-SEANCES","ESCALADE-C-50-SEANCES","ESCALADE-D-100-SEANCES");
            break;
        case "BOXE":
            onTraiteRewardsBasicPalier(filteredKeys,"BOXE-A-1-SEANCE","BOXE-B-10-SEANCES","BOXE-C-50-SEANCES","BOXE-D-100-SEANCES");
            break;
        case "SKI":
            onTraiteRewardsBasicPalier(filteredKeys,"SKI-A-1-SEANCE","SKI-B-10-SEANCES","SKI-C-50-SEANCES","SKI-D-100-SEANCES");
            break;
        case "TRIATHLON":
            onTraiteRewardsBasicPalier(filteredKeys,"TRIATHLON-1-SEANCE");
            break;
        case "ACTIVITE-NAUTIQUE":
            onTraiteRewardsBasicPalier(filteredKeys,"ACTIVITE-NAUTIQUE-A-1-SEANCE","ACTIVITE-NAUTIQUE-B-10-SEANCES","ACTIVITE-NAUTIQUE-C-50-SEANCES","ACTIVITE-NAUTIQUE-D-100-SEANCES");
            break;
        case "ETIREMENT":
            onTraiteRewardsBasicPalier(filteredKeys,"ETIREMENT-A-1-SEANCE","ETIREMENT-B-10-SEANCES","ETIREMENT-C-50-SEANCES","ETIREMENT-D-100-SEANCES");
            break;
        case "GOLF":
            onTraiteRewardsBasicPalier(filteredKeys,"GOLF-A-1-SEANCE","GOLF-B-10-SEANCES","GOLF-C-50-SEANCES","GOLF-D-100-SEANCES");
            break;
        case "TENNIS":
            onTraiteRewardsBasicPalier(filteredKeys,"TENNIS-A-1-SEANCE","TENNIS-B-10-SEANCES","TENNIS-C-50-SEANCES","TENNIS-D-100-SEANCES");
            break;
        case "PATIN-ROLLER":
            onTraiteRewardsBasicPalier(filteredKeys,"PATIN-ROLLER-A-1-SEANCE","PATIN-ROLLER-B-10-SEANCES","PATIN-ROLLER-C-50-SEANCES","PATIN-ROLLER-D-100-SEANCES");
            break;
        case "DANSE":
            onTraiteRewardsBasicPalier(filteredKeys,"DANSE-A-1-SEANCE","DANSE-B-10-SEANCES","DANSE-C-50-SEANCES","DANSE-D-100-SEANCES");
            break;
        case "MUSCULATION":
            onTraiteRewardsBasicPalier(filteredKeys,"MUSCULATION-A-1-SEANCE","MUSCULATION-B-10-SEANCES","MUSCULATION-C-50-SEANCES","MUSCULATION-D-100-SEANCES");
            break;
        case "BADMINTON":
            onTraiteRewardsBasicPalier(filteredKeys,"BADMINTON-A-1-SEANCE","BADMINTON-B-10-SEANCES","BADMINTON-C-50-SEANCES","BADMINTON-D-100-SEANCES");
            break;
        case "BASKETBALL":
            onTraiteRewardsBasicPalier(filteredKeys,"BASKETBALL-A-1-SEANCE","BASKETBALL-B-10-SEANCES","BASKETBALL-C-50-SEANCES","BASKETBALL-D-100-SEANCES");
            break;
        case "FOOTBALL":
            onTraiteRewardsBasicPalier(filteredKeys,"FOOTBALL-A-1-SEANCE","FOOTBALL-B-10-SEANCES","FOOTBALL-C-50-SEANCES","FOOTBALL-D-100-SEANCES");
            break;
        case "HANDBALL":
            onTraiteRewardsBasicPalier(filteredKeys,"HANDBALL-A-1-SEANCE","HANDBALL-B-10-SEANCES","HANDBALL-C-50-SEANCES","HANDBALL-D-100-SEANCES");
            break;
        case "RUGBY":
            onTraiteRewardsBasicPalier(filteredKeys,"RUGBY-A-1-SEANCE","RUGBY-B-10-SEANCES","RUGBY-C-50-SEANCES","RUGBY-D-100-SEANCES");
            break;
        case "TENNIS-TABLE":
            onTraiteRewardsBasicPalier(filteredKeys,"TENNIS-DE-TABLE-A-1-SEANCE","TENNIS-DE-TABLE-B-10-SEANCES","TENNIS-DE-TABLE-C-50-SEANCES","TENNIS-DE-TABLE-D-100-SEANCES");
            break;
        case "VOLLEYBALL":
            onTraiteRewardsBasicPalier(filteredKeys,"VOLLEYBALL-A-1-SEANCE","VOLLEYBALL-B-10-SEANCES","VOLLEYBALL-C-50-SEANCES","VOLLEYBALL-D-100-SEANCES");
            break;
        case "EQUITATION":
            onTraiteRewardsBasicPalier(filteredKeys,"EQUITATION-A-1-SEANCE","EQUITATION-B-10-SEANCES","EQUITATION-C-50-SEANCES","EQUITATION-D-100-SEANCES");
            break;
        case "SNOWBOARD":
            onTraiteRewardsBasicPalier(filteredKeys,"SNOWBOARD-A-1-SEANCE","SNOWBOARD-B-10-SEANCES","SNOWBOARD-C-50-SEANCES","SNOWBOARD-D-100-SEANCES");
            break;
        case "BASEBALL":
            onTraiteRewardsBasicPalier(filteredKeys,"BASEBALL-A-1-SEANCE","BASEBALL-B-10-SEANCES","BASEBALL-C-50-SEANCES","BASEBALL-D-100-SEANCES");
            break;
        case "AUTRE":
            onTraiteRewardsBasicPalier(filteredKeys,"AUTRE-A-1-SEANCE");
            break;
        case "ARTS-MARTIAUX":
            onTraiteRewardsBasicPalier(filteredKeys,"ARTS-MARTIAUX-A-1-SEANCE","ARTS-MARTIAUX-B-10-SEANCES","ARTS-MARTIAUX-C-50-SEANCES","ARTS-MARTIAUX-D-100-SEANCES");
            break;
        case "BREAK-DANCE":
            onTraiteRewardsBasicPalier(filteredKeys,"BREAK-DANCE-A-1-SEANCE","BREAK-DANCE-B-10-SEANCES","BREAK-DANCE-C-50-SEANCES","BREAK-DANCE-D-100-SEANCES");
            break;
        case "GYMNASTIQUE":
            onTraiteRewardsBasicPalier(filteredKeys,"GYMNASTIQUE-A-1-SEANCE","GYMNASTIQUE-B-10-SEANCES","GYMNASTIQUE-C-50-SEANCES","GYMNASTIQUE-D-100-SEANCES");
            break;
        case "SKATEBOARD":
            onTraiteRewardsBasicPalier(filteredKeys,"SKATEBOARD-A-1-SEANCE","SKATEBOARD-B-10-SEANCES","SKATEBOARD-C-50-SEANCES","SKATEBOARD-D-100-SEANCES");
            break;
        case "RENFORCEMENT":
            onTraiteRewardsBasicPalier(filteredKeys,"RENFORCEMENT-A-1-SEANCE","RENFORCEMENT-B-10-SEANCES","RENFORCEMENT-C-50-SEANCES","RENFORCEMENT-D-100-SEANCES");
            break;
        case "ATHLETISME":
            onTraiteRewardsBasicPalier(filteredKeys,"ATHLETISME-A-1-SEANCE","ATHLETISME-B-10-SEANCES","ATHLETISME-C-50-SEANCES","ATHLETISME-D-100-SEANCES");
            break;


        default:
            if (devMode === true){console.log("[REWARDS] Erreur activité non trouvé");};    
        break;
    }

    if (devMode === true){console.log("[REWARDS] FIN de traitement des trophés par type d'activité. Résultat : ",rewardsEligibleArray);};

}



// Traite les trophés définitifs à affecter à l'utilisateur
async function onAffectFinalRewardsToUser() {
    
    if (devMode === true){
        console.log("[REWARDS] Trouve les trophés réelle à affecter à l'USER ");
        console.log("[REWARDS] User éligible à : ",rewardsEligibleArray);
        console.log("[REWARDS] déjà possédé par l'user : ",userRewardsArray);
    };

    if (devMode === true){console.log("[REWARDS] ajout des récompenses à l'utilisateur ");};
    // Ajout des trophes dans le tableau de l'utilisateur
    rewardsEligibleArray.forEach(e=>{
        userRewardsArray.push(e);
    });

    if (devMode === true){
        console.log("[REWARDS] toutes les récompenses utilisateur : ");
        console.log(userRewardsArray.sort());
    };


    // Lance l'event reward obtenu si besoin
    if (rewardsEligibleArray.length >=1) {
        // Insertion dans la base de donnée
        await updateDocumentInDB(rewardsStoreName, (doc) => {
            doc.rewards = userRewardsArray;
            return doc;
        });

        // Recompense in APP
        rewardsEvent(rewardsEligibleArray);
        // Recompense in MOBILE
        onReceiveNotifyMobileEvent(rewardsEligibleArray);
    }else{
        if (devMode === true){console.log(`[REWARDS] [EVENT] Aucun traitement necessaire`);};
    }



}





// Animation des reward
function rewardsEvent(newRewardsList) {

    newRewardsToSee = newRewardsList;//pour la visualisation des nouveaux rewards dans le menu rewards


    // popup recompense obtenue
    let popup = document.getElementById("popupReward");

    popup.classList.add('show');
    setTimeout(() => {
        popup.classList.remove('show');
    }, 3000); // Cache le popup après 3 secondes



    // Changement du style du bouton reward
    document.getElementById("btnMenuRewards").classList.add("rewardAvailable");

}



// Traitement des rewards pour les paliers basic 1-10-50-100  uniquement ce qui n'est pas déjà possédé pour l'user
function onTraiteRewardsBasicPalier(filteredKeys,rewards1Name,rewards10Name,rewards50Name,rewards100Name) {

    let dataLength = filteredKeys.length;

    // 1 séance
    if (rewards1Name !== undefined && !userRewardsArray.includes(rewards1Name)) {
        if (devMode === true){console.log(`[REWARDS] [BASIC PALIER] Test eligibilité pour : ${rewards1Name}`);};
        let isEligible = dataLength >= 1;//car il faut traiter si les gens l'ont utilisé avant la mise à jours
        if (isEligible) {
            rewardsEligibleArray.push(rewards1Name);
        }
        if (devMode === true){console.log("[REWARDS] [BASIC PALIER] Resultat : " + isEligible);};
    }
     
    // 10 séances
    if (rewards10Name !== undefined  && !userRewardsArray.includes(rewards10Name)) {
        if (devMode === true){console.log(`[REWARDS] [BASIC PALIER] Test eligibilité pour : ${rewards10Name}`);};
        let isEligible = dataLength >= 10;//car il faut traiter si les gens l'ont utilisé avant la mise à jours
        if (isEligible) {
            rewardsEligibleArray.push(rewards10Name);
        }
        if (devMode === true){console.log("[REWARDS] [BASIC PALIER] Resultat : " + isEligible);};
    }
    
    // 50 séances
    if (rewards50Name !== undefined  && !userRewardsArray.includes(rewards50Name)) {
        if (devMode === true){console.log(`[REWARDS] [BASIC PALIER] Test eligibilité pour : ${rewards50Name}`);};
        let isEligible = dataLength >= 50;//car il faut traiter si les gens l'ont utilisé avant la mise à jours
        if (isEligible) {
            rewardsEligibleArray.push(rewards50Name);
        }
        if (devMode === true){console.log("[REWARDS] [BASIC PALIER] Resultat : " + isEligible);};
    }

    // 100 séances
    if (rewards100Name !== undefined && !userRewardsArray.includes(rewards100Name)) {
        if (devMode === true){console.log(`[REWARDS] [BASIC PALIER] Test eligibilité pour : ${rewards100Name}`);};
        let isEligible = dataLength >= 100;//car il faut traiter si les gens l'ont utilisé avant la mise à jours
        if (isEligible) {
            rewardsEligibleArray.push(rewards100Name);
        }
        if (devMode === true){console.log("[REWARDS] [BASIC PALIER] Resultat : " + isEligible);};
    } 
}


// Traitement récompenses spécifique courses à pieds uniquement si l'user ne la pas.
function onTraiteRewardsSpecificCAP(filteredKeys) {

    // Distance = entre 10 km et 10.950 km
    if (!userRewardsArray.includes("CAP-E-10-KM")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-E-10-KM");};
        let isEligible = onSearchActivityWithDistanceRange(filteredKeys,10,10.999);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-E-10-KM");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }

    

    // Distance = entre 21 km et 21.950 km
    if (!userRewardsArray.includes("CAP-F-SEMI-MARATHON")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-F-SEMI-MARATHON");};
        let isEligible = onSearchActivityWithDistanceRange(filteredKeys,21,21.999);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-F-SEMI-MARATHON");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }

    

    // Distance =  entre 42km et 42.999 km
    if (!userRewardsArray.includes("CAP-G-MARATHON")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-G-MARATHON");};
        let isEligible = onSearchActivityWithDistanceRange(filteredKeys,42,42.999);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-G-MARATHON");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }



    
    // Distance > 100km en une séance
    if (!userRewardsArray.includes("CAP-ULTRA-TRAIL")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-ULTRA-TRAIL");};
        let isEligible = onSearchActivityWithDistanceSuperior(filteredKeys,100);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-ULTRA-TRAIL");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }  
}
   

// Recompense spécifiques pour les vélos
function onTraiteRewardsSpecificVELO(filteredKeys) {
    

    // Distance supérieur à 100 km en une séance
    if (!userRewardsArray.includes("VELO-E-100-KM")) {
        if (devMode === true){console.log("[REWARDS] [VELO] Test eligibilité pour : VELO-E-100-KM");};
        let isEligible = onSearchActivityWithDistanceSuperior(filteredKeys,100);
        if (isEligible) {
            rewardsEligibleArray.push("VELO-E-100-KM");
        }
        if (devMode === true){console.log("[REWARDS] [VELO] Resultat : " + isEligible);};
    }

    // Distance cumulé supérieur à 3400 km
    if (!userRewardsArray.includes("VELO-F-3400-KM")) {
        if (devMode === true){console.log("[REWARDS] [VELO] Test eligibilité pour : VELO-F-3400-KM");};
        let isEligible =  onSearchActivitiesTotalDistanceSuperior(filteredKeys,3400);
        if (isEligible) {
            rewardsEligibleArray.push("VELO-F-3400-KM");
        }
        if (devMode === true){console.log("[REWARDS] [VELO] Resultat : " + isEligible);};
    }
} 



// Recompense spécifiques pour natation
function onTraiteRewardsSpecificNATATION(filteredKeys) {
    
    // Distance cumulé supérieur à 50 km
    if (!userRewardsArray.includes("NATATION-E-50-KM")) {
        if (devMode === true){console.log("[REWARDS] [NATATION] Test eligibilité pour : NATATION-E-50-KM");};
        let isEligible =  onSearchActivitiesTotalDistanceSuperior(filteredKeys,50);
        if (isEligible) {
            rewardsEligibleArray.push("NATATION-E-50-KM");
        }
        if (devMode === true){console.log("[REWARDS] [NATATION] Resultat : " + isEligible);};
    }
}


// Recompense spécifiques pour natation
function onTraiteRewardsSpecificMARCHE(filteredKeys) {
    
    // Distance cumulé supérieur à 1000 km
    if (!userRewardsArray.includes("MARCHE-RANDO-E-1000-KM")) {
        if (devMode === true){console.log("[REWARDS] [MARCHE-RANDO] Test eligibilité pour : MARCHE-RANDO-E-1000-KM");};
        let isEligible =  onSearchActivitiesTotalDistanceSuperior(filteredKeys,1000);
        if (isEligible) {
            rewardsEligibleArray.push("MARCHE-RANDO-E-1000-KM");
        }
        if (devMode === true){console.log("[REWARDS] [MARCHE-RANDO] Resultat : " + isEligible);};
    }
}












//    -----------------------------     QUITTE MENU       ----------------------------------------------





   
//    Reset le menu des récompenses

function onResetRewardsMenu() {
    imgRewardsFullScreenRef= "";
    pRewardsFullScreenTextRef = "";
    pRewardsFullScreenTitleRef = "";
    divRewardsListRef = "";

    divRewardsListRef.innerHTML = "";


    newRewardsToSee = [];
    rewardAllActivityNonPlannedKeys = [];
}
   
   
   
   
   // Retour depuis Trophy
function onClickReturnFromRewards() {

    onResetRewardsMenu();
   
    // ferme le menu
    onLeaveMenu("Rewards");
}