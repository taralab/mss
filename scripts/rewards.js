
// Les trophes possédés par l'utilisateur
let userRewardsArray = [],
    rewardsEligibleArray = [], //stockes les trophés auxquels l'utilisateur est éligible 
    newRewardsToSee = [],//les nouveaux trophé obtenu. Vidé lorsque l'utilisateur quitte le menu récompense
    rewardAllActivityNonPlannedArray = [], // tableau qui contient les activités non planifiées
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
function onSearchActivitiesTotalDistanceRange(activitiesData, bottomValue, topValue){

    if (devMode === true){console.log(`[REWARDS] recherche Distances cumulées Range entre : ${bottomValue} et ${topValue}`);};

    const totalDistance = activitiesData.reduce((sum, activity) => {
        // Si la distance est un nombre valide
        if (activity.distance) {
            return sum + parseFloat(activity.distance); // Additionner la distance en nombre flottant
        }
        return sum; // Si ce n'est pas la bonne activité ou si la distance est vide, garder la somme actuelle
    }, 0); // La somme commence à 0
    
    if (devMode === true){console.log("Valeur totale distance = " + totalDistance);};
    
    return totalDistance >= bottomValue && totalDistance <= topValue;

};



// DISTANCE CUMULE pour un type d'activité. Est-ce que c'est supérieure ? 
function onSearchActivitiesTotalDistanceSuperior(data,targetValue){

    if (devMode === true){console.log(`[REWARDS] recherche Distances cumulées supérieures à : ${targetValue}`);};

    const totalDistance = data.reduce((sum, activity) => {
        // si la distance est un nombre valide
        if (activity.distance) {
            return sum + parseFloat(activity.distance); // Additionner la distance en nombre flottant
        }
        return sum; // Si ce n'est pas la bonne activité ou si la distance est vide, garder la somme actuelle
    }, 0); // La somme commence à 0
    
    if (devMode === true){console.log("Valeur totale distance = " + totalDistance);};
    
    return totalDistance >= targetValue;
};



// DISTANCE UNIQUE d'une activité spécifique. Est-ce que c'est dans la fourchette ? 
function onSearchActivityWithDistanceRange(data, bottomTarget, topTarget) {
    if (devMode === true){console.log(`[REWARDS] recherche d'une distance unique comprise entre : ${bottomTarget} et ${topTarget}`);};
    let targetFound = false;

    for (let e of data){
        if (devMode === true){console.log(Number(e.distance));};
        if (Number(e.distance) >= bottomTarget  && Number(e.distance) <= topTarget) {
            targetFound = true;
            break;  
        };
    };

    return targetFound;
}

// DISTANCE UNIQUE d'une activité spécifique. Est-ce que c'est supérieur ? 
function onSearchActivityWithDistanceSuperior(data,targetValue) {

    if (devMode === true){console.log(`[REWARDS] recherche d'une distance unique supérieures à : ${targetValue}`);};
    let targetFound = false;

    for (let e of data){
        if (devMode === true){console.log(Number(e.distance));};
        if (Number(e.distance) >= targetValue) {
            targetFound = true;
            break;
        };
    };

    return targetFound;
}




// Fonction de recherche du nombre d'activité différentes
function onSearchVariousActivitiesNumber(allData,targetValue,currentActivity) {
    if (devMode === true){console.log(`[REWARDS] Recheche d'activite de type different. Nombre cible : ${targetValue} et activite en cours : ${currentActivity}`);};


    let allTypeActivityList = [];

    // Insertion de l'activité en cours dans la liste
    if (!allTypeActivityList.includes(currentActivity)) {
        allTypeActivityList.push(currentActivity);
    }

    // Recupère les catégories d'activités différentes
    for (let e of allData){
        if (!allTypeActivityList.includes(e.name))  {
            allTypeActivityList.push(e.name);
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






function onCheckReward(currentActivitySaved) {

    onSearchGeneralRewards(currentActivitySaved);

}

// Recherche d'éligibilité aux trophés communs
function onSearchGeneralRewards(activityTarget) {





    // Reset la variable
    rewardsEligibleArray = [];
    rewardAllActivityNonPlannedArray = [];

    //filtre sur les activité accomplit
    
    rewardAllActivityNonPlannedArray = allUserActivityArray.filter(activity =>{
        return activity.isPlanned === false
    });

    if (devMode === true){
        console.log("[REWARDS] retrait des activité planifié")
        console.log("Nbre activité retiré = " + (allUserActivityArray.length - rewardAllActivityNonPlannedArray.length));
    ;};


    let activityArrayLength = rewardAllActivityNonPlannedArray.length;


    // Traitement des récompenses génériques
    if (devMode === true){console.log("[REWARDS] Traitement des récompenses génériques");};


    // POLYVALENT (5 activités différentes)
    if (!userRewardsArray.includes("POLYVALENT")) {
        if (devMode === true){console.log("[REWARDS] [GENERIQUE] Test eligibilité pour : POLYVALENT");};
        let isEligible = onSearchVariousActivitiesNumber(rewardAllActivityNonPlannedArray,5,activityTarget);
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



    onTraiteRewardAnniversaryAndAbsent(activityTarget,rewardAllActivityNonPlannedArray);

}


// Fonction reward Anniversaire - DE RETOUR
function onTraiteRewardAnniversaryAndAbsent(activityTarget,allActivity) {

    let tempAllActivity = allActivity;
    let arrayLength =tempAllActivity.length;

    // Doit au moins avoir 2 activités pour traiter ce reward
    if (arrayLength >= 2) {

        //Lance le trie par date
        tempAllActivity.sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri par date décroissante

        // ANNIVERSAIRE
        if (!userRewardsArray.includes("1-AN")){
            if (devMode === true){console.log(`[REWARDS] [COMMUN]  : test eligibilite pour : 1-AN`);};
            // Recupère la date du jour
            let dateToday = new Date();

            // récupère la date la plus ancienne ancienne
            let olderActivityDate = new Date(tempAllActivity[arrayLength -1].date);
            // Calculer la différence en millisecondes
            const differenceYearInMilliseconds = Math.abs(dateToday - olderActivityDate);
            // Convertir la différence en années
            const differenceInYears = differenceYearInMilliseconds / (1000 * 60 * 60 * 24 * 365);
            // Vérifier si la différence est supérieure à 1 an
            let isEligible = differenceInYears > 1;
            if (isEligible) {
                rewardsEligibleArray.push("1-AN");
            }
            if (devMode === true){console.log(`[REWARDS] [COMMUN]  : 1-AN resultat : ` + isEligible);};   
        }


        // DE RETOUR
        if (!userRewardsArray.includes("DE-RETOUR")) {
            if (devMode === true){console.log(`[REWARDS] [COMMUN]  : test eligibilite pour : DE-RETOUR`);};

            // Date la plus récente et celle juste avant
            let newestActivityDate = new Date(tempAllActivity[0].date);
            let previousActivityDate = new Date(tempAllActivity[1].date);

            // Calcul de différence
            const differenceDayInMilliseconds = Math.abs(newestActivityDate - previousActivityDate);
            const differenceInDays = differenceDayInMilliseconds / (24 * 60 * 60 * 1000);

            let isEligible = differenceInDays > 30;
            if (isEligible) {
                rewardsEligibleArray.push("DE-RETOUR");
            }
            if (devMode === true){console.log(`[REWARDS] [COMMUN]  : DE-RETOUR resultat : ` + isEligible);};   
        }
    }else{
        if (devMode === true){console.log(`[REWARDS] [ANNIVERSARY and ABSENT]  : pas assez de donnée pour le traitement`);};
    }



    
    // Traitement pour l'activité spécifique
    // Récupère uniquement les données concernant l'activité en question
    let activitiesTargetData = allActivity.filter(e=>{
        // Recupère toutes les d'activités concernés
        return e.name === activityTarget;
    });

    onSearchSpecifyRewards(activityTarget,activitiesTargetData);
}





// Traitement des récompenses spécitique à l'activité créée ou modifiée
function onSearchSpecifyRewards(activityTarget,filteredData) {


    switch (activityTarget) {
        case "C-A-P":
            onTraiteRewardsBasicPalier(filteredData,"CAP-A-1-SEANCE","CAP-B-10-SEANCES","CAP-C-50-SEANCES","CAP-D-100-SEANCES");
            onTraiteRewardsSpecificCAP(filteredData);
            break;
        case "VELO":
            onTraiteRewardsBasicPalier(filteredData,"VELO-A-1-SEANCE","VELO-B-10-SEANCES","VELO-C-50-SEANCES","VELO-D-100-SEANCES");
            onTraiteRewardsSpecificVELO(filteredData);
            break;
        case "FRACTIONNE":
            onTraiteRewardsBasicPalier(filteredData,"FRACTIONNE-A-1-SEANCE","FRACTIONNE-B-10-SEANCES","FRACTIONNE-C-50-SEANCES","FRACTIONNE-D-100-SEANCES");
            break;
        case "MARCHE-RANDO":
            onTraiteRewardsBasicPalier(filteredData,"MARCHE-RANDO-A-1-SEANCE","MARCHE-RANDO-B-10-SEANCES","MARCHE-RANDO-C-50-SEANCES","MARCHE-RANDO-D-100-SEANCES");
            onTraiteRewardsSpecificMARCHE(filteredData);
            break;
        case "NATATION":
            onTraiteRewardsBasicPalier(filteredData,"NATATION-A-1-SEANCE","NATATION-B-10-SEANCES","NATATION-C-50-SEANCES","NATATION-D-100-SEANCES");
            onTraiteRewardsSpecificNATATION(filteredData);
            break;
        case "CROSSFIT":
            onTraiteRewardsBasicPalier(filteredData,"CROSSFIT-A-1-SEANCE","CROSSFIT-B-10-SEANCES","CROSSFIT-C-50-SEANCES","CROSSFIT-D-100-SEANCES");
            break;
        case "YOGA":
            onTraiteRewardsBasicPalier(filteredData,"YOGA-A-1-SEANCE","YOGA-B-10-SEANCES","YOGA-C-50-SEANCES","YOGA-D-100-SEANCES");
            break;
        case "SPORT-CO":
            onTraiteRewardsBasicPalier(filteredData,"SPORT-CO-A-1-SEANCE","SPORT-CO-B-10-SEANCES","SPORT-CO-C-50-SEANCES","SPORT-CO-D-100-SEANCES");
            break;
        case "ESCALADE":
            onTraiteRewardsBasicPalier(filteredData,"ESCALADE-A-1-SEANCE","ESCALADE-B-10-SEANCES","ESCALADE-C-50-SEANCES","ESCALADE-D-100-SEANCES");
            break;
        case "BOXE":
            onTraiteRewardsBasicPalier(filteredData,"BOXE-A-1-SEANCE","BOXE-B-10-SEANCES","BOXE-C-50-SEANCES","BOXE-D-100-SEANCES");
            break;
        case "SKI":
            onTraiteRewardsBasicPalier(filteredData,"SKI-A-1-SEANCE","SKI-B-10-SEANCES","SKI-C-50-SEANCES","SKI-D-100-SEANCES");
            break;
        case "TRIATHLON":
            onTraiteRewardsBasicPalier(filteredData,"TRIATHLON-1-SEANCE");
            break;
        case "ACTIVITE-NAUTIQUE":
            onTraiteRewardsBasicPalier(filteredData,"ACTIVITE-NAUTIQUE-A-1-SEANCE","ACTIVITE-NAUTIQUE-B-10-SEANCES","ACTIVITE-NAUTIQUE-C-50-SEANCES","ACTIVITE-NAUTIQUE-D-100-SEANCES");
            break;
        case "ETIREMENT":
            onTraiteRewardsBasicPalier(filteredData,"ETIREMENT-A-1-SEANCE","ETIREMENT-B-10-SEANCES","ETIREMENT-C-50-SEANCES","ETIREMENT-D-100-SEANCES");
            break;
        case "GOLF":
            onTraiteRewardsBasicPalier(filteredData,"GOLF-A-1-SEANCE","GOLF-B-10-SEANCES","GOLF-C-50-SEANCES","GOLF-D-100-SEANCES");
            break;
        case "TENNIS":
            onTraiteRewardsBasicPalier(filteredData,"TENNIS-A-1-SEANCE","TENNIS-B-10-SEANCES","TENNIS-C-50-SEANCES","TENNIS-D-100-SEANCES");
            break;
        case "PATIN-ROLLER":
            onTraiteRewardsBasicPalier(filteredData,"PATIN-ROLLER-A-1-SEANCE","PATIN-ROLLER-B-10-SEANCES","PATIN-ROLLER-C-50-SEANCES","PATIN-ROLLER-D-100-SEANCES");
            break;
        case "DANSE":
            onTraiteRewardsBasicPalier(filteredData,"DANSE-A-1-SEANCE","DANSE-B-10-SEANCES","DANSE-C-50-SEANCES","DANSE-D-100-SEANCES");
            break;
        case "MUSCULATION":
            onTraiteRewardsBasicPalier(filteredData,"MUSCULATION-A-1-SEANCE","MUSCULATION-B-10-SEANCES","MUSCULATION-C-50-SEANCES","MUSCULATION-D-100-SEANCES");
            break;
        case "BADMINTON":
            onTraiteRewardsBasicPalier(filteredData,"BADMINTON-A-1-SEANCE","BADMINTON-B-10-SEANCES","BADMINTON-C-50-SEANCES","BADMINTON-D-100-SEANCES");
            break;
        case "BASKETBALL":
            onTraiteRewardsBasicPalier(filteredData,"BASKETBALL-A-1-SEANCE","BASKETBALL-B-10-SEANCES","BASKETBALL-C-50-SEANCES","BASKETBALL-D-100-SEANCES");
            break;
        case "FOOTBALL":
            onTraiteRewardsBasicPalier(filteredData,"FOOTBALL-A-1-SEANCE","FOOTBALL-B-10-SEANCES","FOOTBALL-C-50-SEANCES","FOOTBALL-D-100-SEANCES");
            break;
        case "HANDBALL":
            onTraiteRewardsBasicPalier(filteredData,"HANDBALL-A-1-SEANCE","HANDBALL-B-10-SEANCES","HANDBALL-C-50-SEANCES","HANDBALL-D-100-SEANCES");
            break;
        case "RUGBY":
            onTraiteRewardsBasicPalier(filteredData,"RUGBY-A-1-SEANCE","RUGBY-B-10-SEANCES","RUGBY-C-50-SEANCES","RUGBY-D-100-SEANCES");
            break;
        case "TENNIS-TABLE":
            onTraiteRewardsBasicPalier(filteredData,"TENNIS-DE-TABLE-A-1-SEANCE","TENNIS-DE-TABLE-B-10-SEANCES","TENNIS-DE-TABLE-C-50-SEANCES","TENNIS-DE-TABLE-D-100-SEANCES");
            break;
        case "VOLLEYBALL":
            onTraiteRewardsBasicPalier(filteredData,"VOLLEYBALL-A-1-SEANCE","VOLLEYBALL-B-10-SEANCES","VOLLEYBALL-C-50-SEANCES","VOLLEYBALL-D-100-SEANCES");
            break;
        case "EQUITATION":
            onTraiteRewardsBasicPalier(filteredData,"EQUITATION-A-1-SEANCE","EQUITATION-B-10-SEANCES","EQUITATION-C-50-SEANCES","EQUITATION-D-100-SEANCES");
            break;
        case "SNOWBOARD":
            onTraiteRewardsBasicPalier(filteredData,"SNOWBOARD-A-1-SEANCE","SNOWBOARD-B-10-SEANCES","SNOWBOARD-C-50-SEANCES","SNOWBOARD-D-100-SEANCES");
            break;
        case "BASEBALL":
            onTraiteRewardsBasicPalier(filteredData,"BASEBALL-A-1-SEANCE","BASEBALL-B-10-SEANCES","BASEBALL-C-50-SEANCES","BASEBALL-D-100-SEANCES");
            break;
        case "AUTRE":
            onTraiteRewardsBasicPalier(filteredData,"AUTRE-A-1-SEANCE");
            break;
        case "ARTS-MARTIAUX":
            onTraiteRewardsBasicPalier(filteredData,"ARTS-MARTIAUX-A-1-SEANCE","ARTS-MARTIAUX-B-10-SEANCES","ARTS-MARTIAUX-C-50-SEANCES","ARTS-MARTIAUX-D-100-SEANCES");
            break;
        case "BREAK-DANCE":
            onTraiteRewardsBasicPalier(filteredData,"BREAK-DANCE-A-1-SEANCE","BREAK-DANCE-B-10-SEANCES","BREAK-DANCE-C-50-SEANCES","BREAK-DANCE-D-100-SEANCES");
            break;
        case "GYMNASTIQUE":
            onTraiteRewardsBasicPalier(filteredData,"GYMNASTIQUE-A-1-SEANCE","GYMNASTIQUE-B-10-SEANCES","GYMNASTIQUE-C-50-SEANCES","GYMNASTIQUE-D-100-SEANCES");
            break;
        case "SKATEBOARD":
            onTraiteRewardsBasicPalier(filteredData,"SKATEBOARD-A-1-SEANCE","SKATEBOARD-B-10-SEANCES","SKATEBOARD-C-50-SEANCES","SKATEBOARD-D-100-SEANCES");
            break;
        case "RENFORCEMENT":
            onTraiteRewardsBasicPalier(filteredData,"RENFORCEMENT-A-1-SEANCE","RENFORCEMENT-B-10-SEANCES","RENFORCEMENT-C-50-SEANCES","RENFORCEMENT-D-100-SEANCES");
            break;
        case "ATHLETISME":
            onTraiteRewardsBasicPalier(filteredData,"ATHLETISME-A-1-SEANCE","ATHLETISME-B-10-SEANCES","ATHLETISME-C-50-SEANCES","ATHLETISME-D-100-SEANCES");
            break;


        default:
            if (devMode === true){console.log("[REWARDS] Erreur activité non trouvé");};    
        break;
    }

    if (devMode === true){console.log("[REWARDS] FIN de traitement des trophés par type d'activité. Résultat : ");};
    if (devMode === true){console.log(rewardsEligibleArray);};


    // Traite les trophés définitifs à affecter à l'utilisateur
    onAffectFinalRewardsToUser();
}



// Traite les trophés définitifs à affecter à l'utilisateur
async function onAffectFinalRewardsToUser() {
    
    if (devMode === true){
        console.log("[REWARDS] Trouve les trophés réelle à affecter à l'USER ");
        console.log("[REWARDS] User éligible à : ");
        console.log(rewardsEligibleArray);
        console.log("[REWARDS] déjà possédé par l'user : ");
        console.log(userRewardsArray);
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
function onTraiteRewardsBasicPalier(filteredData,rewards1Name,rewards10Name,rewards50Name,rewards100Name) {

    let dataLength = filteredData.length;

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
function onTraiteRewardsSpecificCAP(filteredData) {

    // Distance = entre 10 km et 10.950 km
    if (!userRewardsArray.includes("CAP-E-10-KM")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-E-10-KM");};
        let isEligible = onSearchActivityWithDistanceRange(filteredData,10,10.999);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-E-10-KM");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }

    

    // Distance = entre 21 km et 21.950 km
    if (!userRewardsArray.includes("CAP-F-SEMI-MARATHON")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-F-SEMI-MARATHON");};
        let isEligible = onSearchActivityWithDistanceRange(filteredData,21,21.999);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-F-SEMI-MARATHON");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }

    

    // Distance =  entre 42km et 42.999 km
    if (!userRewardsArray.includes("CAP-G-MARATHON")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-G-MARATHON");};
        let isEligible = onSearchActivityWithDistanceRange(filteredData,42,42.999);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-G-MARATHON");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }



    
    // Distance > 100km en une séance
    if (!userRewardsArray.includes("CAP-ULTRA-TRAIL")) {
        if (devMode === true){console.log("[REWARDS] [C-A-P] Test eligibilité pour : CAP-ULTRA-TRAIL");};
        let isEligible = onSearchActivityWithDistanceSuperior(filteredData,100);
        if (isEligible) {
            rewardsEligibleArray.push("CAP-ULTRA-TRAIL");
        }
        if (devMode === true){console.log("[REWARDS] [C-A-P] Resultat : " + isEligible);};
    }

    
}
   

// Recompense spécifiques pour les vélos
function onTraiteRewardsSpecificVELO(filteredData) {
    

    // Distance supérieur à 100 km en une séance
    if (!userRewardsArray.includes("VELO-E-100-KM")) {
        if (devMode === true){console.log("[REWARDS] [VELO] Test eligibilité pour : VELO-E-100-KM");};
        let isEligible = onSearchActivityWithDistanceSuperior(filteredData,100);
        if (isEligible) {
            rewardsEligibleArray.push("VELO-E-100-KM");
        }
        if (devMode === true){console.log("[REWARDS] [VELO] Resultat : " + isEligible);};
    }

    // Distance cumulé supérieur à 3400 km
    if (!userRewardsArray.includes("VELO-F-3400-KM")) {
        if (devMode === true){console.log("[REWARDS] [VELO] Test eligibilité pour : VELO-F-3400-KM");};
        let isEligible =  onSearchActivitiesTotalDistanceSuperior(filteredData,3400);
        if (isEligible) {
            rewardsEligibleArray.push("VELO-F-3400-KM");
        }
        if (devMode === true){console.log("[REWARDS] [VELO] Resultat : " + isEligible);};
    }
} 



// Recompense spécifiques pour natation
function onTraiteRewardsSpecificNATATION(filteredData) {
    
    // Distance cumulé supérieur à 50 km
    if (!userRewardsArray.includes("NATATION-E-50-KM")) {
        if (devMode === true){console.log("[REWARDS] [NATATION] Test eligibilité pour : NATATION-E-50-KM");};
        let isEligible =  onSearchActivitiesTotalDistanceSuperior(filteredData,50);
        if (isEligible) {
            rewardsEligibleArray.push("NATATION-E-50-KM");
        }
        if (devMode === true){console.log("[REWARDS] [NATATION] Resultat : " + isEligible);};
    }
}


// Recompense spécifiques pour natation
function onTraiteRewardsSpecificMARCHE(filteredData) {
    
    // Distance cumulé supérieur à 1000 km
    if (!userRewardsArray.includes("MARCHE-RANDO-E-1000-KM")) {
        if (devMode === true){console.log("[REWARDS] [MARCHE-RANDO] Test eligibilité pour : MARCHE-RANDO-E-1000-KM");};
        let isEligible =  onSearchActivitiesTotalDistanceSuperior(filteredData,1000);
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
    rewardAllActivityNonPlannedArray = [];
}
   
   
   
   
   // Retour depuis Trophy
function onClickReturnFromRewards() {

    onResetRewardsMenu();
   
    // ferme le menu
    onLeaveMenu("Rewards");
}