
// Ouverture du menu
function onOpenMenuStat(){
    if (devMode === true){console.log("Ouverture menu STAT");};


    statActivityNonPlannedArray = allUserActivityArray.filter(activity =>{
        return activity.isPlanned === false
    });

    if (devMode === true){
        console.log("Retrait des activités programmées");
        console.log("Nbre activité retiré = " + (allUserActivityArray.length - statActivityNonPlannedArray.length));
    
    };

    onGenerateDynamiqueStatFilter(statActivityNonPlannedArray);

    displayGeneralStats(statActivityNonPlannedArray);
}

// Referencement
let selectorStatRef = document.getElementById("selectorStat");

// Array qui va contenir toutes les activités non planifiées
let statActivityNonPlannedArray = [];




// remplit dynamiquement les options dans le selection de statistique
function onGenerateDynamiqueStatFilter(allData) {
    if (devMode === true){console.log("[STAT] récupère les types d'activité de l'utilisateur" )};
    let dynamicFilterList = [];
    


    // Recupère les nouvelle catégorie présente dans la liste en cours
    allData.forEach(data=>{
        if (!dynamicFilterList.includes(data.name))  {
            dynamicFilterList.push(data.name);
        };
    });

    dynamicFilterList.sort();


    if (devMode === true){
        console.log("[STAT] valeur de dynamicFilterList = " );
        console.log(dynamicFilterList);
    };

    // Crée les options dans le selection pour les catégorie
    onGenerateStatOptionFilter(dynamicFilterList);
};



// Génération des options d'activité pour le filtre avec tri
function onGenerateStatOptionFilter(allActivityTypeData) {

    selectorStatRef.innerHTML = "";


    // Ajouter l'option "Tous" au début
    let allOption = document.createElement("option");
    allOption.value = "GENERAL";
    allOption.innerHTML = "Général";
    selectorStatRef.appendChild(allOption);



    // Ajouter les autres options triées
    allActivityTypeData.forEach(activityType => {

        let newOption = document.createElement("option");
        newOption.value = activityType;
        newOption.innerHTML = activityChoiceArray[activityType].displayName;
        selectorStatRef.appendChild(newOption);
    });


    onGenerateFakeStatOptionFilter(allActivityTypeData);
};




function onGenerateFakeStatOptionFilter(allActivityData) {
    let parentTargetRef = document.getElementById("divFakeSelectOptStatList");

    // Traite d'abord les favoris
    if (devMode === true){
        console.log("[FAKE SELECTOR STAT] Lancement de la generation des choix des activités dans le filtre");
        console.log("[FAKE SELECTOR STAT] ID Parent pour insertion : " + parentTargetRef);
    };

    parentTargetRef.innerHTML = "";


    // Le bouton radio sera set sur générales


    // Ajouter l'option "Tous" au début
    let newContainer = document.createElement("div");
    newContainer.classList.add("fake-opt-item-container");
    newContainer.onclick = function (event){
        event.stopPropagation();
        onCloseFakeStatSelectOpt();
        selectorStatRef.value = "GENERAL";
        onChangeFakeSelecStatFilterRadio("btnRadio-filter-stat-general");
        onChangeStatActivitySelector("GENERAL");
    }
    // Ajout la ligne bleu 
    newContainer.classList.add("fake-opt-item-last-favourite");

    let newImg = document.createElement("img");
    newImg.classList.add("fake-opt-item");
    newImg.src = "./images/icon-All.webp";

    let newTitle = document.createElement("span");
    newTitle.innerHTML = "Générales";
    newTitle.classList.add("fake-opt-item");

    // Bouton radio fake pour simuler le selecteur
    let newBtnRadioFake = document.createElement("div");
    newBtnRadioFake.classList.add("radio-button-fake","selected");
    newBtnRadioFake.id = "btnRadio-filter-stat-general";

    // Insertion
    newContainer.appendChild(newImg);
    newContainer.appendChild(newTitle);
    newContainer.appendChild(newBtnRadioFake);

    parentTargetRef.appendChild(newContainer);


    // Ajout de reste des activités
    allActivityData.forEach((e,index)=>{

         // Creation
        let newContainer = document.createElement("div");
        newContainer.classList.add("fake-opt-item-container");
        newContainer.onclick = function (event){
            event.stopPropagation();
            onCloseFakeStatSelectOpt();
            selectorStatRef.value = e;
            onChangeFakeSelecStatFilterRadio(`btnRadio-filter-stat-${e}`);
            onChangeStatActivitySelector(e);
        }


        // Style sans border botton pour le dernier
        if (index === (allActivityData.length - 1)) {
            newContainer.classList.add("fake-opt-item-last-container");
        }

        let newImg = document.createElement("img");
        newImg.classList.add("fake-opt-item");
        newImg.src = activityChoiceArray[e].imgRef;

        let newTitle = document.createElement("span");
        newTitle.innerHTML = activityChoiceArray[e].displayName;
        newTitle.classList.add("fake-opt-item");


        // Bouton radio fake pour simuler le selecteur
        let newBtnRadioFake = document.createElement("div");
        newBtnRadioFake.classList.add("radio-button-fake");
        newBtnRadioFake.id = "btnRadio-filter-stat-" + e;

        // Insertion
        newContainer.appendChild(newImg);
        newContainer.appendChild(newTitle);
        newContainer.appendChild(newBtnRadioFake);

        parentTargetRef.appendChild(newContainer);
    })

}




// Clique sur le fake selecteur
function onClickFakeStatSelect(){
    // Affiche le fake option
    document.getElementById("divFakeSelectOptStat").style.display = "flex";
}


function onCloseFakeStatSelectOpt(event){
    document.getElementById("divFakeSelectOptStat").style.display = "none";
}


// Retire les boutons radio plein à tous les boutons
function onChangeFakeSelecStatFilterRadio(idToSelect){
    // Pour rechercher dans les enfants d'un parent spécifique
    let parent = document.getElementById("divFakeSelectOptStatList");


    // Retire les boutons radio plein
    let elementToRemoveClass = parent.querySelectorAll(".selected");
    elementToRemoveClass.forEach(e=>{
        e.classList.remove("selected");
    });


    // le met à l'option en cours
    document.getElementById(idToSelect).classList.add("selected");
};





// ------------------------------------   GENERATION DES STAT --------------------------------







// Fonction onChange pour changer entre général et activité spécifique
function onChangeStatActivitySelector(value) {
    if (devMode === true){console.log("[SELECTOR] Changement de sélection :", value);};

    if (value === "GENERAL") {
        // Appeler la fonction pour afficher les statistiques générales
        displayGeneralStats(statActivityNonPlannedArray);
    } else {
        // Appeler la fonction pour afficher les statistiques de l'activité sélectionnée
        displayActivityStats(value);
    }
}






// Fonction pour convertir la durée au format hh:mm:ss en minutes
function durationToMinutes(duration) {
    if (!duration || typeof duration !== "string") {
        duration = "00:00:00"; // Valeur par défaut si la durée est invalide
    }
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0) + (seconds || 0) / 60; // Conversion totale en minutes
}

// Fonction pour formater la durée en heures:minutes:secondes
function formatDuration(totalMinutes) {
    if (isNaN(totalMinutes) || totalMinutes < 0) {
        return "00:00:00"; // Valeur par défaut si les minutes totales sont invalides
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes % 1) * 60);

    // Formater en HH:MM:SS
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}






// Récupère les statistiques de l'activité
function getStats(activityList, days = null) {
    const today = new Date();

    // Filtrer les sessions pour l'activité donnée
    const filteredSessions = activityList.filter(activity => {
        const isWithinDays = days
            ? (today - new Date(activity.date)) / (1000 * 60 * 60 * 24) <= days
            : true; // Inclure toutes les sessions si `days` est null
        return isWithinDays;
    });

    // Si aucune session n'est trouvée, renvoyer des valeurs par défaut
    if (filteredSessions.length === 0) {
        return {
            totalSessions: 0,
            totalDuration: 0,
            totalDistance: 0,
            lastActivityDate: null,
            firstActivityDate: null
        };
    }

    // Trier les sessions par date (du plus récent au plus ancien)
    filteredSessions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculer les statistiques
    const totalSessions = filteredSessions.length;
    const totalDuration = filteredSessions.reduce((sum, session) =>
        sum + durationToMinutes(session.duration || "00:00:00"), 0
    ); // En minutes
    const totalDistance = filteredSessions.reduce((sum, session) =>
        sum + parseFloat(session.distance || 0), 0
    );

    // Dernière activité pratiquée (la plus récente)
    const lastActivityDate = new Date(filteredSessions[0].date); // La première après le tri est la plus récente

    // Première activité pratiquée (la plus ancienne)
    const firstActivityDate = new Date(filteredSessions[filteredSessions.length - 1].date); // La dernière après le tri est la plus ancienne

    return {
        totalSessions,
        totalDuration, // En minutes
        totalDistance, // En km
        lastActivityDate,
        firstActivityDate,
    };
}


function onTreateStatGraphic(activityList) {

    if (devMode === true){
        console.log("[STAT] Traitement des graphiques");
        console.log("[STAT] extraction et trie des années");
    };
        // extraction des années 
        let yearArray = [];
        activityList.forEach(e=>{
            const dateObject = new Date(e.date);
            const year = dateObject.getFullYear();
            if (!yearArray.includes(year)) {
                yearArray.push(year);
            }
        });

        // Trie par ordre décroissant
        yearArray.sort((a, b) => b - a);

        if (devMode === true){
            console.log(yearArray);
        };



        // creation des options pour les années
        let selectRef = document.getElementById("selectStatGraphYear");
        selectRef.innerHTML = "";
    
        yearArray.forEach(e=>{
            let newOption = document.createElement("option");
            newOption.value = e;
            newOption.innerHTML = e;
    
            selectRef.appendChild(newOption);
        });

        // Lancement du comptage sur la première année du tableau
        getActivityStatCountByMonth(activityList,yearArray[0]);

}





const monthStatNamesArray = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
];

function getActivityStatCountByMonth(activityList,yearTarget) {


    // Objet qui stocke les comptes des activité classé
    let countActivityByMonth = {
        january : {count : 0, distance: 0 , duration : 0},
        february : {count : 0, distance: 0 , duration : 0},
        march :  {count : 0, distance: 0 , duration : 0},
        april :  {count : 0, distance: 0 , duration : 0},
        may : {count : 0, distance: 0 , duration : 0},
        june : {count : 0, distance: 0 , duration : 0},
        july :  {count : 0, distance: 0 , duration : 0}, 
        august :  {count : 0, distance: 0 , duration : 0},
        september :  {count : 0, distance: 0 , duration : 0}, 
        october :  {count : 0, distance: 0 , duration : 0},
        november :  {count : 0, distance: 0 , duration : 0},
        december:  {count : 0, distance: 0 , duration : 0},
    }; 

    let totalCountYear = 0,
        totalDistanceYear = 0,
        totalDurationYear = 0;

    activityList.forEach(e=>{

        const dateObject = new Date(e.date);
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth();
        const monthName = monthStatNamesArray[month];


        // Si l'année correspond, ajoute + 1 dans le mois de l'activité
        if (year === yearTarget) { 
            countActivityByMonth[monthName].count++;


            // ancienne valeur
            let oldDistance = Number(countActivityByMonth[monthName].distance) || 0;
            // Valeur à ajouter
            let newDistance = parseFloat(e.distance) ||0 ;
            // addition
            let distanceToAdd = oldDistance + newDistance;
            distanceToAdd = Math.round(distanceToAdd * 10) / 10;//arrondi 1 décimale
            countActivityByMonth[monthName].distance = distanceToAdd;



            // Additionne les durée
            // ancienne valeur
            let oldDuration = Number(countActivityByMonth[monthName].duration) || 0;

            // Valeur à ajouter
            let newDuration = durationToMinutes(e.duration || "00:00:00");


            let durationToAdd = oldDuration + newDuration;

            countActivityByMonth[monthName].duration = durationToAdd;

            // calcul également le total sur l'année
            totalCountYear++;
            totalDistanceYear += newDistance;
            totalDurationYear += newDuration;
        }
    });


    if (devMode === true){
        
        console.log("[STAT] longueur de la liste d'activité cible :" + activityList.length);
        console.log("[STAT] Comptage répartition par mois selon l'année : " + yearTarget);
        console.log(countActivityByMonth);
        console.log("[STAT] Recherche du mois avec la valeur la plus haute");
    };


    // Trouve le mois avec le plus de tâches (mois de référence pour les 100%)
    const maxCountMonth = Object.keys(countActivityByMonth).reduce((a, b) => countActivityByMonth[a].count > countActivityByMonth[b].count ? a : b);
    if (devMode === true){console.log("[STAT] " + maxCountMonth);};

    // Trouve le mois avec la distance la plus élevé (mois de référence pour les 100%)
    const maxDistanceMonth = Object.keys(countActivityByMonth).reduce((a, b) => countActivityByMonth[a].distance > countActivityByMonth[b].distance ? a : b);
    if (devMode === true){console.log("[STAT] " + maxDistanceMonth);};

    // Trouve le mois avec la durée la plus élevé (mois de référence pour les 100%)
    const maxDurationMonth = Object.keys(countActivityByMonth).reduce((a, b) => countActivityByMonth[a].duration > countActivityByMonth[b].duration ? a : b);
    if (devMode === true){console.log("[STAT] " + maxDistanceMonth);};


    onSetResumeByYear(totalCountYear,totalDistanceYear,formatDuration(totalDurationYear));
    onSetGraphicItems(countActivityByMonth,countActivityByMonth[maxCountMonth].count,countActivityByMonth[maxDistanceMonth].distance,countActivityByMonth[maxDurationMonth].duration);
}


// convertir les minutes au format 2h45
function formatMinutesToHoursForGraph(minutes) {
    if (minutes <= 0) return "0h00"; // Gestion du cas zéro ou négatif

    let hours = Math.floor(minutes / 60); // Partie entière = heures
    let mins = minutes % 60; // Reste = minutes
    roundMins = parseInt(mins);
     
    return `${hours}h${roundMins.toString().padStart(2, "0")}`; // Ajout du "0" si nécessaire
}


// set le résumé par année
function onSetResumeByYear(count,distance,hour) {
    let pTarget = document.getElementById("pStatResumeByYear");
    distanceFormated = Math.round(distance * 100) / 100;

    pTarget.innerHTML = `Activité(s) :<b> ${count} </b> - Distance :<b> ${distanceFormated} km</b> - Durée :<b> ${hour}</b>`;
}

// set les éléments graphiques après comptage

function onSetGraphicItems(activityCount,higherCountValue,higherDistanceValue,higherDurationValue) {


    // Retire toutes les classes "StatHigherValue" pour ceux qui les ont
    // Pour rechercher dans les enfants d'un parent spécifique
    let parent = document.getElementById("divStat");


    // Retire les class StatHigherValue
    let elementToRemoveClass = parent.querySelectorAll(".StatHigherValue");

    elementToRemoveClass.forEach(e=>{
       e.classList.remove("StatHigherValue");
    });


    if (devMode === true){
        console.log("[STAT] Set le graphique");
        console.log("[STAT] valeur maximale pour référence pourcentage count : " + higherCountValue);
        console.log("[STAT] valeur maximale pour référence pourcentage distance : " + higherDistanceValue);
        console.log("[STAT] valeur maximale pour référence pourcentage heures : " + higherDurationValue);
    };


    // COUNT
    monthStatNamesArray.forEach(e=>{
        document.getElementById(`stat-number-${e}`).innerHTML = activityCount[e].count;
        document.getElementById(`stat-PB-${e}`).style = "--progress:" + onCalculStatPercent(higherCountValue,activityCount[e].count) + "%";

        // Traitement valeur la plus élevée (mise en gras)
        if (activityCount[e].count === higherCountValue) {
            document.getElementById(`spanGraphCountMonthName-${e}`).classList.add("StatHigherValue");
            document.getElementById(`stat-number-${e}`).classList.add("StatHigherValue");
        }

    });

    // DISTANCE
    monthStatNamesArray.forEach(e=>{
        document.getElementById(`stat-distance-${e}`).innerHTML = activityCount[e].distance;
        document.getElementById(`stat-PB-Distance-${e}`).style = "--progress:" + onCalculStatPercent(higherDistanceValue,activityCount[e].distance) + "%";

        // Traitement valeur la plus élevée (mise en gras)
        if (activityCount[e].distance === higherDistanceValue) {
            document.getElementById(`spanGraphDistanceMonthName-${e}`).classList.add("StatHigherValue");
            document.getElementById(`stat-distance-${e}`).classList.add("StatHigherValue");
        }
    });


    // DURATION
    monthStatNamesArray.forEach(e=>{
        document.getElementById(`stat-duration-${e}`).innerHTML = formatMinutesToHoursForGraph(activityCount[e].duration);
        document.getElementById(`stat-PB-Duration-${e}`).style = "--progress:" + onCalculStatPercent(higherDurationValue,activityCount[e].duration) + "%";

        // Traitement valeur la plus élevée (mise en gras)
        if (activityCount[e].duration === higherDurationValue) {
            document.getElementById(`spanGraphDurationMonthName-${e}`).classList.add("StatHigherValue");
            document.getElementById(`stat-duration-${e}`).classList.add("StatHigherValue");
        }
    });

}

// Calcul de pourcentage
function onCalculStatPercent(referenceValue, currentItemValue) {
    return (currentItemValue / referenceValue) * 100;
};





// Changement de graphique selon l'année appeler depuis le selecteur d'année
function onChangeSelectorYearGraph(yearTarget){

    // Lancement du trie

    let currentActivitySelected = selectorStatRef.value;

    if (devMode === true){
        console.log("[STAT] Changement d'année pour activité " + currentActivitySelected);
    };


    if (currentActivitySelected === "GENERAL") {
        getActivityStatCountByMonth(statActivityNonPlannedArray,Number(yearTarget));
    } else {
        // Récupère uniquement les données concernant l'activité en question
        let activitiesTargetData = statActivityNonPlannedArray.filter(e=>{
            // Recupère toutes les activités concernés
            return e.name === currentActivitySelected;
        });
        getActivityStatCountByMonth(activitiesTargetData,Number(yearTarget));
    }    
}











// Affichage des activités
function displayActivityStats(activityName) {
    if (devMode === true){console.log("[STAT] demande de stat pour " + activityName);};

    // Récupère uniquement les données concernant l'activité en question
    let activitiesTargetData = statActivityNonPlannedArray.filter(e=>{
        // Recupère toutes les activités concernés
        return e.name === activityName;
    });


    // Récupérer les statistiques
    const statsAllTime = getStats(activitiesTargetData);
    const stats7Days = getStats(activitiesTargetData, 7);
    const stats30Days = getStats(activitiesTargetData, 30);

    // Formater les dates des premières et dernières activités pratiquées
    const firstActivityDateFormatted = statsAllTime.firstActivityDate
        ? statsAllTime.firstActivityDate.toLocaleDateString("fr-FR")
        : "Aucune activité";
    const lastActivityDateFormatted = statsAllTime.lastActivityDate
        ? statsAllTime.lastActivityDate.toLocaleDateString("fr-FR")
        : "Aucune activité";

    // Calcul des informations générales
    const totalKm = statsAllTime.totalDistance.toFixed(2);
    const totalDurationFormatted = formatDuration(statsAllTime.totalDuration);

    // Texte convivial pour l'utilisateur (si distance > 0 ou non)
    const generalText1 = statsAllTime.totalDistance > 0 
        ? `Depuis le <b>${firstActivityDateFormatted}</b>, tu as pratiqué <b>${statsAllTime.totalSessions} session(s)</b> de <b>${activityName.replace("_", " ").toUpperCase()}</b>, parcouru environ <b>${totalKm} km</b> et accumulé un total de <b>${totalDurationFormatted} heure(s) </b> de pratique.`
        : `Depuis le <b>${firstActivityDateFormatted}</b>, tu as pratiqué <b>${statsAllTime.totalSessions} session(s)</b> de <b>${activityName.replace("_", " ").toUpperCase()}</b> et accumulé un total de <b>${totalDurationFormatted} heure(s)</b> de pratique.`;


    const generalText2 = `Ta dernière activité de ce type remonte au <b>${lastActivityDateFormatted}</b>.`;

    // Vérification pour les 7 derniers jours
    const sevenDaysText = stats7Days.totalSessions === 0 
        ? "<p>Il semble que tu n'aies pas pratiqué cette activité ces derniers jours.</p>" 
        : stats7Days.totalDistance > 0
            ? `
                <p>${stats7Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats7Days.totalDuration)} - 🚶${stats7Days.totalDistance.toFixed(2)} km</p>
            `
            : `
                <p>${stats7Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats7Days.totalDuration)} - 🤷 0 km</p>
            `;

    // Vérification pour les 30 derniers jours
    const thirtyDaysText = stats30Days.totalSessions === 0 
        ? "<p>Cela fait un certain temps que tu n'as pas pratiqué cette activité.</p>" 
        : stats30Days.totalDistance > 0
            ? `
                <p>${stats30Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats30Days.totalDuration)} - 🚶 ${stats30Days.totalDistance.toFixed(2)} km</p>
            `
            : `
                <p>${stats30Days.totalSessions} séance(s) - ⏱️ ${formatDuration(stats30Days.totalDuration)} - 🤷 0 km</p>
            `;

    // Afficher les résultats
    document.getElementById("stats").innerHTML = `
        <h2 class="stat-title-1">Résumé pour : <span class="highlight">${activityName.replace("_", " ")}</span></h2>
        
        <section class="stat">
            <p>${generalText1}</p>
            <p>${generalText2}</p>
        </section>
        
        <section class="stat">
            <p><b>Sur les 7 derniers jours :</b></p>
            <p>${sevenDaysText}</p>
        </section>
        
        <section class="stat">
            <p><b>Sur les 30 derniers jours :</b></p>
            <p>${thirtyDaysText}</p>
        </section>
    `;

    // traitement des graphiques
    onTreateStatGraphic(activitiesTargetData);
}




// Fonction pour afficher les statistiques générales
function displayGeneralStats(activityList) {
    if (!activityList || activityList.length === 0) {
        document.getElementById("stats").innerHTML = `
            <p>Bienvenue ! Commence à enregistrer tes activités pour découvrir tes statistiques ici. 🚀</p>
        `;
        return;
    }

    // Calculs nécessaires
    const totalActivities = activityList.length;
    const totalDuration = activityList.reduce((sum, activity) => 
        sum + durationToMinutes(activity.duration || "00:00:00"), 0
    );
    const totalDistance = activityList.reduce((sum, activity) => 
        sum + parseFloat(activity.distance || 0), 0
    );
    const firstActivityDate = new Date(Math.min(...activityList.map(a => new Date(a.date))));
    const formattedDate = firstActivityDate.toLocaleDateString("fr-FR");

    const favouriteActivityName =getMostPracticedActivity(activityList); // Activité la plus pratiquée




    // Texte convivial pour l'utilisateur
    document.getElementById("stats").innerHTML = `
        <h2 class="stat-title-1">Résumé général : </h2>
        <section class="stat">
            <p>
                Depuis le <b>${formattedDate}</b>, tu as pratiqué <b>${totalActivities} activité(s)</b>, 
                parcouru environ <b>${totalDistance.toFixed(2)} km</b> et accumulé un total de <b>${formatDuration(totalDuration)} heure(s)</b> de sport. 
            </p>
            <p>Activité la plus pratiquée : <b>${favouriteActivityName}</b>.</p>

            <p>Bravo ! 👍</p>
        </section>
    `;



    // traitement des graphiques
    onTreateStatGraphic(activityList);
}



// Fonction de calcul de l'activité la plus pratiquée
function getMostPracticedActivity(data) {

    if (devMode === true){console.log(" [STAT] General : calcul de l'activité la plus pratiquée.");};


    if (!Array.isArray(data) || data.length === 0) {
        return null; // Retourne null si le tableau est vide ou invalide
    }

    // Étape 1 : Compter les occurrences de chaque activité
    const activityCounts = data.reduce((acc, obj) => {

        if (obj.name) {
            acc[obj.name] = (acc[obj.name] || 0) + 1; // Incrémente le compteur
        }
        return acc;
    }, {});

    // Étape 2 : Trouver l'activité avec la valeur maximale
    let mostPracticed = null;
    let maxCount = 0;

    for (const [activity, count] of Object.entries(activityCounts)) {
        if (count > maxCount) {
            mostPracticed = activity;
            maxCount = count;
        }
    }

    if (devMode === true){console.log(`[STAT] Resultat : ${mostPracticed} avec ${maxCount} activités.` );};


    return mostPracticed;
}


// Reset les éléments du graphique
function onResetStatGraph() {
    if (devMode === true){console.log(`[STAT] Reset du tableau graphique` );};
    // Reset le tableau d'array
    document.getElementById("selectStatGraphYear").innerHTML= "";

    // Vide le tableau de toutes les activités non planifié
    statActivityNonPlannedArray = [];


    monthStatNamesArray.forEach(e=>{
        // reset les progress bar et les nombres

        document.getElementById("stat-PB-" + e).style = "--progress: 0%;";
        document.getElementById("stat-number-" + e).innerHTML = "0";

        // Pour les distances
        document.getElementById("stat-PB-Distance-" + e).style = "--progress: 0%;";
        document.getElementById("stat-distance-" + e).innerHTML = "0";

        // Pour les heures
        document.getElementById("stat-PB-Duration-" + e).style = "--progress: 0%;";
        document.getElementById("stat-duration-" + e).innerHTML = "0";
    });


 
}



// Retour depuis Stat
function onClickReturnFromStat() {
    onResetStatGraph();

    // ferme le menu
    onLeaveMenu("Stat");
};