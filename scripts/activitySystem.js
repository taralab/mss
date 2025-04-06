

// Format de l'objet pour une nouvelle activité
let activityToInsertFormat = {
    name :"",
    date : "",
    location : "",
    distance : "",
    duration : "",
    comment : "",
    createdAt : "",
    isPlanned : false
};


let allUserActivityArray = [], //Contient toutes les activités créé par l'utilisateur
    userActivityListToDisplay = [], // contient les activités triées et filtrées à afficher
    maxActivityPerCycle = 15,//Nbre d'élément maximale à afficher avant d'avoir le bouton "afficher plus"
    userActivityListIndexToStart = 0, //Index de démarrage pour l'affichage d'activité
    currentActivityDataInView,//contient les données d'une activité en cours d'affichage. Permet de comparer les modifications
    activityTagPlanned  = "planifie",
    activityTagDone = "effectue",
    isActivityPlannedExist = false,
    currentActivityEditorID = "";


// Reférencement

let pInterfaceActivityTitleRef = document.getElementById("pInterfaceActivityTitle"),
    inputDateRef = document.getElementById("inputDate"),
    inputLocationRef = document.getElementById("inputLocation"),
    inputDistanceRef = document.getElementById("inputDistance"),
    inputDurationActivityHoursRef = document.getElementById("inputDurationActivityHours"),
    inputDurationActivityMinutesRef = document.getElementById("inputDurationActivityMinutes"),
    inputDurationActivitySecondsRef = document.getElementById("inputDurationActivitySeconds"),
    textareaCommentRef = document.getElementById("textareaComment"),
    selectorCategoryChoiceRef = document.getElementById("selectorCategoryChoice"),
    divItemListRef = document.getElementById("divItemList"),
    imgEditorActivityPreviewRef = document.getElementById("imgEditorActivityPreview"),
    inputIsPlannedRef = document.getElementById("inputIsPlanned"),
    pEditorActivityPreviewPlannedIconRef = document.getElementById("pEditorActivityPreviewPlannedIcon");




// Genere la liste pour l'editeur d'activité
onGenerateActivityOptionChoice("selectorCategoryChoice");
onGenerateFakeOptionList("divFakeSelectOptList");






// ------------------------------Fonction générale pour activity ----------------------------------


// fonction pour récupérer les activité et les modèles
async function onLoadActivityFromDB () {
    allUserActivityArray = [];
    try {
        const result = await db.allDocs({ include_docs: true }); // Récupère tous les documents

        // Filtrer les éléments concernée
        allUserActivityArray = result.rows
            .map(row => row.doc)
            .filter(doc => doc.type === activityStoreName);
            if (devMode === true){
                console.log("[DATABASE] [ACTIVITY] Activités chargées :", activityStoreName);
                console.log(allUserActivityArray[0]);
            };
    } catch (err) {
        console.error("[DATABASE] [ACTIVITY] Erreur lors du chargement:", err);
    }
}






// Insertion nouvelle activité (ID auto, )
async function onInsertNewActivityInDB(activityToInsertFormat) {
    try {
        const newActivity = {
            type: activityStoreName,
            ...activityToInsertFormat
        };

        // Utilisation de post() pour génération automatique de l’ID
        const response = await db.post(newActivity);

        // Mise à jour de l’objet avec _id et _rev retournés
        newActivity._id = response.id;
        newActivity._rev = response.rev;

        if (devMode === true) {
            console.log("[DATABASE] [ACTIVITY] Activité insérée :", newActivity);
        }

        return newActivity;
    } catch (err) {
        console.error("[DATABASE] [ACTIVITY] Erreur lors de l'insertion de l'activité :", err);
    }
}


// Modification Activity
async function onInsertActivityModificationInDB(activityToUpdate, key) {
    try {
        let existingDoc = await db.get(key);

        // Exclure `_id` et `_rev` de activityToUpdate pour éviter qu'ils ne soient écrasés
        const { _id, _rev, ...safeActivityUpdate } = activityToUpdate;

        const updatedDoc = {
            ...existingDoc,  // Garde `_id` et `_rev`
            ...safeActivityUpdate // Applique les nouvelles valeurs en évitant d'écraser `_id` et `_rev`
        };

        // Sauvegarde dans la base
        const response = await db.put(updatedDoc);

        if (devMode) console.log("[ACTIVITY] Activité mise à jour :", response);

        return updatedDoc; // Retourne l'objet mis à jour
    } catch (err) {
        console.error("Erreur lors de la mise à jour de l'activité :", err);
        return false; // Indique que la mise à jour a échoué
    }
}

// Suppression template
async function deleteActivity(activityKey) {
    try {
        // Récupérer le document à supprimer
        let docToDelete = await db.get(activityKey);

        // Supprimer le document
        await db.remove(docToDelete);

        if (devMode === true ) {console.log("[ACTIVITY] Activité supprimée :", activityKey);};

        return true; // Indique que la suppression s'est bien passée
    } catch (err) {
        console.error("[ACTIVITY] Erreur lors de la suppression de l'activité :", err);
        return false; // Indique une erreur
    }
}


// Recherche de template par son id/key
async function findActivityById(activityId) {
    try {
        const activity = await db.get(activityId); // Recherche dans la base
        if (devMode) console.log("[ACTIVITY] Activité trouvé :", activity);
        currentActivityEditorID = activityId;
        return activity; // Retourne l'objet trouvé
    } catch (err) {
        console.error("[ACTIVITY] Erreur lors de la recherche du template :", err);
        return null; // Retourne null si non trouvé
    }
}



// Fonction de recherche d'une activité dans AllUserActivityArray.
function onSearchActivity(keyRef) {
    if (devMode === true){console.log("Affichage de l'activité dans 'AllUserActivityArray' avec la key :  " + keyRef);};
    return allUserActivityArray.find(activity => activity._id === keyRef);
}




// ------------------------------FIN fonction générale pour activity ----------------------------------







function onOpenNewActivity() {

    activityEditorMode = "creation";
    if (devMode === true){console.log("ouverture de l'editeur d'activité en mode " + activityEditorMode);};

    // Initialise les éléments
    onResetActivityInputs();
    
};

function onOpenNewActivityFromTemplate(templateItem) {
    // Initialise les éléments
    onResetActivityInputs();
    onSetBtnRadio(templateItem.activityName);

    activityEditorMode = "creation";

    if (devMode === true){console.log("ouverture de l'editeur d'activité depuis un template en mode " + activityEditorMode);};


    console.log("Valeur de templateItem : ");
    console.log(templateItem);


    //Set avec le élément du template
    inputLocationRef.value = templateItem.location;
    inputDistanceRef.value = templateItem.distance;
    textareaCommentRef.value = templateItem.comment;
    inputIsPlannedRef.checked = templateItem.isPlanned;


    // gestion du format duration
    let convertDuration = timeFormatToInputNumber(templateItem.duration);
    inputDurationActivityHoursRef.value = convertDuration.hours;
    inputDurationActivityMinutesRef.value = convertDuration.minutes;
    inputDurationActivitySecondsRef.value = convertDuration.seconds;


    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorCategoryChoiceRef.value = templateItem.activityName;

    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = activityChoiceArray[templateItem.activityName].imgRef;
    pEditorActivityPreviewPlannedIconRef.innerHTML = templateItem.isPlanned ? "🗓️ Cette activité est planifiée.":"";
}


// Reset les inputs du menu activité
function onResetActivityInputs() {
    if (devMode === true){console.log("reset les inputs du menu activité");};
    inputDateRef.value = "";
    inputLocationRef.value = "";
    inputDistanceRef.value = "";
    inputDurationActivityHoursRef.value = "00";
    inputDurationActivityMinutesRef.value = "00";
    inputDurationActivitySecondsRef.value = "00";
    textareaCommentRef.value = "";
    inputIsPlannedRef.checked = false;

    // pour le selecteur d'activité, met le premier éléments qui à dans favoris, ou sinon CAP par défaut, C-A-P
    selectorCategoryChoiceRef.value = userFavoris.length > 0 ? userFavoris[0] : "C-A-P";
   
    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = userFavoris.length > 0 ? activityChoiceArray[userFavoris[0]].imgRef  : activityChoiceArray["C-A-P"].imgRef;
    pEditorActivityPreviewPlannedIconRef.innerHTML = "";

    inputDateRef.classList.remove("fieldRequired");
};



// Empêche d'utiliser une date ultérieure (non utilisé actuellement)

function initMaxDate() {

    if (devMode === true){console.log("Blocage de la date maximale à ");};
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    inputDateRef.setAttribute('max', formattedDate);

    if (devMode === true){console.log("Blocage de la date maximale à " + formattedDate);};

}





// Insertion des activités dans la liste

function onInsertActivityInList(activityToDisplay) {

    // Stock les activité à afficher dans un tableau
    userActivityListToDisplay = activityToDisplay;
    userActivityListIndexToStart = 0;


    if (devMode === true){
        console.log("nbre d'activité total à afficher = " + userActivityListToDisplay.length);
        console.log("Nbre max d'activité affiché par cycle = " + maxActivityPerCycle);
        console.log("Vide la liste des activités");
    };

    divItemListRef.innerHTML = "";

    if (userActivityListToDisplay.length === 0) {
        divItemListRef.innerHTML = "Aucune activité à afficher !";
        return
    }else{
        if (devMode === true){console.log("Demande d'insertion du premier cycle d'activité dans la liste");};
        onInsertMoreActivity();
    };


};

// séquence d'insertion  d'activité dans la liste selon le nombre limite définit
function onInsertMoreActivity() {
    if (devMode === true){console.log("Lancement d'un cycle d'insertion d'activité.");};
    let cycleCount = 0;

    if (devMode === true){console.log("Index de départ = " + userActivityListIndexToStart);};



    for (let i = userActivityListIndexToStart; i < userActivityListToDisplay.length; i++) {

        if (cycleCount >= maxActivityPerCycle) {
            if (devMode === true){console.log("Max par cycle atteinds = " + maxActivityPerCycle);};
            // Creation du bouton More
            onCreateMoreActivityBtn();
            userActivityListIndexToStart += maxActivityPerCycle;
            if (devMode === true){console.log("mise a jour du prochain index to start = " + userActivityListIndexToStart);};
            // Arrete la boucle si lorsque le cycle est atteind
            return
        }else{
            onInsertOneActivity(userActivityListToDisplay[i],i === userActivityListToDisplay.length-1);
        };
        cycleCount++;
    };

    
};




// Fonction d'insertion d'une activité dans la liste avec gestion spécial pour le dernier element
// et gestion pour les activités planifiées
function onInsertOneActivity(activity,isLastIndex) {

    // La div de l'item avec une marge spéciale pour le dernier éléments
    let newItemContainer = document.createElement("div");

    newItemContainer.classList.add("item-container");
    if (activity.isPlanned) {
        newItemContainer.classList.add("item-planned");
    }

    newItemContainer.onclick = function () {
        onClickOnActivity(activity._id);
    };


    // La zone de l'image
    let newImageContainer = document.createElement("div");
    newImageContainer.classList.add("item-image-container");

    let newImage = document.createElement("img");
    newImage.classList.add("activity");
    newImage.src = activityChoiceArray[activity.name].imgRef;

    newImageContainer.appendChild(newImage);



    // la zone des données

    let newDivDataContainer =  document.createElement("div");
    newDivDataContainer.classList.add("item-data-container");


    // Area 1
    let newDivDataArea1 = document.createElement("div");
    newDivDataArea1.classList.add("item-data-area1");

    let newItemDistance = document.createElement("p");
    if (activity.isPlanned) {
        newItemDistance.classList.add("item-data-distance-planned");
    }else{
        newItemDistance.classList.add("item-data-distance");
    }




    newItemDistance.innerHTML = activity.distance != "" ? activity.distance + " km": "---";

    let newItemDuration = document.createElement("p");
    if (activity.isPlanned) {
        newItemDuration.classList.add("item-data-duration-planned");
    }else{
        newItemDuration.classList.add("item-data-duration");
    }



    newItemDuration.innerHTML = activity.duration;

    let newItemDate = document.createElement("p");
    newItemDate.classList.add("item-data-date");
    newItemDate.innerHTML = onDisplayUserFriendlyDate(activity.date);

    

    newDivDataArea1.appendChild(newItemDistance);
    newDivDataArea1.appendChild(newItemDuration);
    newDivDataArea1.appendChild(newItemDate);

    // Area 2
    let newDivDataArea2 = document.createElement("div");
    newDivDataArea2.classList.add("item-data-area2");

    let newItemLocation = document.createElement("p");
    newItemLocation.classList.add("item-data-location");
    newItemLocation.innerHTML = activity.location != "" ? activity.location : "---";

    newDivDataArea2.appendChild(newItemLocation);
    

    // Area3
    let newDivDataArea3 = document.createElement("div");
    newDivDataArea3.classList.add("item-data-area3");

    let newItemComment = document.createElement("p");
    if (activity.isPlanned) {
        newItemComment.setAttribute("data-type",activityTagPlanned);
        newItemComment.classList.add(currentCommentPlannedClassName);

    } else {
        newItemComment.setAttribute("data-type",activityTagDone);
        newItemComment.classList.add(currentCommentDoneClassName);
    }




    newItemComment.innerHTML = activity.comment;
    newDivDataArea3.appendChild(newItemComment);



    // Insertion totale
    newDivDataContainer.appendChild(newDivDataArea1);
    newDivDataContainer.appendChild(newDivDataArea2);
    newDivDataContainer.appendChild(newDivDataArea3);

    newItemContainer.appendChild(newImageContainer);
    newItemContainer.appendChild(newDivDataContainer);

    // TEST BOUTON ICS
    if (activity.isPlanned) {
        // Génération
        let newBtnICS = document.createElement("button");
        newBtnICS.innerHTML = "🗓️";
        newBtnICS.classList.add("buttonAddCalendar");
        newBtnICS.onclick = function (event){
            event.stopPropagation();
            onClickAddToCalendar(activity._id);
        }
        //Insertion
        newDivDataArea2.appendChild(newBtnICS);
    }





    divItemListRef.appendChild(newItemContainer);



    // gestion derniere activité de la liste
    // Insertion d'un trait en fin de liste
    if (isLastIndex) {
        let newClotureList = document.createElement("span");
        newClotureList.classList.add("last-container");
        newClotureList.innerHTML = "ℹ️ Vos activités sont stockées dans votre navigateur.";
        divItemListRef.appendChild(newClotureList);
    }
};


// Fonction pour le bouton MoreActivity pour afficher les activités utilisateurs suivantes

function onCreateMoreActivityBtn() {


    // La div de l'item
    let newItemContainerBtnMore = document.createElement("div");
    newItemContainerBtnMore.classList.add("moreItem");
    newItemContainerBtnMore.id = "btnMoreItem";

    newItemContainerBtnMore.onclick = function (){
        onDeleteBtnMoreItem();
        onInsertMoreActivity();
    };


    let newTextBtnMore = document.createElement("p");
    newTextBtnMore.classList.add("moreItem");
    newTextBtnMore.innerHTML = "Afficher plus d'activités";

    // Insertion


    newItemContainerBtnMore.appendChild(newTextBtnMore);

    divItemListRef.appendChild(newItemContainerBtnMore);

};




// Fonction pour supprimer le bouton "more item"
function onDeleteBtnMoreItem() {
    // Sélection de l'élément avec l'ID "liToto"
    let btnToDelete = document.getElementById("btnMoreItem");
    
    // Vérification si l'élément existe avant de le supprimer
    if (btnToDelete) {
        btnToDelete.remove();
        if (devMode === true){console.log("Suppression du bouton More Item");};
    } else {
        if (devMode === true){console.log("Le bouton more item n'est pas trouvé");};
    };
};














// ---------------------------------  EDITEUR d'activité ---------------------

// Variable pour connaitre dans quel mode l'editeur d'activité est ouvert
let activityEditorMode; //  creation, modification, 











function onClickReturnFromActivityEditor() {
    onLeaveMenu("Activity");
};






function onClickSaveFromActivityEditor() {
    // Verrouillage de la div pour éviter double clic et créer des problèmes
    onLockDivDoubleClick(["divActivityEditor","divBtnActivity"]);
    // Lancement du formatage de l'activité
    onFormatActivity();
};



// Set l'image de prévisualisation d'activité dans l'éditeur
function onChangeActivityPreview(dataName) {
    if (devMode === true){console.log(dataName);};
    imgEditorActivityPreviewRef.src = activityChoiceArray[dataName].imgRef;
} 

// Set l'icone "temporaire" dans la prévisualisation
function onChangeActivityPlanned(checkBoxValue) {
    pEditorActivityPreviewPlannedIconRef.innerHTML = checkBoxValue ? "🗓️ Cette activité est planifiée.":"";
}




// ------------------------------------- Modification d'activité --------------------------------





// clique sur un item
function onClickOnActivity(keyRef) {
    onResetActivityInputs();

    currentActivityEditorID = keyRef;

    let activityToDisplay = onSearchActivity(keyRef);

    currentActivityDataInView = activityToDisplay;//pour la comparaison par la suite
    onEditActivity(activityToDisplay);

    onChangeMenu("EditActivity");
};






function onEditActivity(activityTarget) {

    // Set le mode d'edition de l'activité
    activityEditorMode = "modification";
    // Set les boutons radio
    onSetBtnRadio(activityTarget.name);

    if (devMode === true){console.log("ouverture de l'editeur d'activité en mode " + activityEditorMode);};

    selectorCategoryChoiceRef.value = activityTarget.name;
    inputDateRef.value = activityTarget.date;
    inputLocationRef.value = activityTarget.location;
    inputDistanceRef.value = activityTarget.distance;
    textareaCommentRef.value = activityTarget.comment;
    inputIsPlannedRef.checked = activityTarget.isPlanned;


    // gestion du format duration
    let convertDuration = timeFormatToInputNumber(activityTarget.duration);
    inputDurationActivityHoursRef.value = convertDuration.hours;
    inputDurationActivityMinutesRef.value = convertDuration.minutes;
    inputDurationActivitySecondsRef.value = convertDuration.seconds;

    // l'image de prévisualisation 
    imgEditorActivityPreviewRef.src = activityChoiceArray[activityTarget.name].imgRef;
    // prévisualisation coché temporaire
    pEditorActivityPreviewPlannedIconRef.innerHTML = activityTarget.isPlanned ? "🗓️ Cette activité est planifiée." : "";
};



// -------------------------- Création d'activité ---------------------------------








// formatage de la nouvelle activité avant insertion dans la base
function onFormatActivity() {


    if (activityEditorMode === "creation") {
        if (devMode === true){console.log("Demande de création nouvelle activité");};
    }else if(activityEditorMode === "modification"){
        if (devMode === true){console.log("Demande d'enregistrement d'une modification d'activité");};
    };
    



    // Verification des champs requis
    if (devMode === true){console.log("[ NEW ACTIVITE ] controle des champs requis");};
    let emptyField = onCheckEmptyField(inputDateRef.value);

    if (emptyField === true) {
        if (devMode === true){console.log("[ NEW ACTIVITE ] Champ obligatoire non remplis");};

        inputDateRef.classList.add("fieldRequired");
        onUnlockDivDoubleClick(["divActivityEditor","divBtnActivity"]);//retire la sécurité du clic
        return
    };



    //  met tous les éléments dans l'objet
    activityToInsertFormat.name = selectorCategoryChoiceRef.value;
    activityToInsertFormat.date = inputDateRef.value;
    activityToInsertFormat.distance = inputDistanceRef.value;
    activityToInsertFormat.location = onSetToUppercase(inputLocationRef.value);
    activityToInsertFormat.comment = textareaCommentRef.value;
    activityToInsertFormat.duration = inputActivityNumberToTime();

    // Ne set la date de création que lors d'une création et non lors d'une modification
    if (activityEditorMode === "creation") {
        activityToInsertFormat.createdAt = new Date().toISOString();
    }else {
        activityToInsertFormat.createdAt = currentActivityDataInView.createdAt;
    };

    


    // Gestion planification  : les dates après la date du jour sont obligatoirement des activités planifiées
    // si date ultérieur automatiquement planifié sinon, regarde la valeur checkbox
    //ATTENTION : "Aujourd'hui" comment à partir d'1 heure du matin pour l'application
    const isPlannedBySystem = isDateAfterToday(inputDateRef.value);
    activityToInsertFormat.isPlanned = isPlannedBySystem ? true : inputIsPlannedRef.checked;


    // Demande d'insertion dans la base soit en creation ou en modification


    if (activityEditorMode === "creation") {
        eventInsertNewActivity(activityToInsertFormat,false);
    }else if(activityEditorMode === "modification"){
        onCheckIfModifiedRequired(activityToInsertFormat);
    };

};


// Sauvegarde uniquement si une modification a bien été effectuée dans les données
function onCheckIfModifiedRequired(activityToInsertFormat) {
    
    // Création d'une liste de champs à comparer
    const fieldsToCompare = [
        { oldValue: currentActivityDataInView.name, newValue: activityToInsertFormat.name },
        { oldValue: currentActivityDataInView.date, newValue: activityToInsertFormat.date },
        { oldValue: currentActivityDataInView.distance, newValue: activityToInsertFormat.distance },
        { oldValue: currentActivityDataInView.location, newValue: activityToInsertFormat.location },
        { oldValue: currentActivityDataInView.comment, newValue:  activityToInsertFormat.comment },
        { oldValue: currentActivityDataInView.duration, newValue:  activityToInsertFormat.duration },
        { oldValue: currentActivityDataInView.isPlanned, newValue:  activityToInsertFormat.isPlanned }
    ];

    if (devMode) {
        fieldsToCompare.forEach(e=>{
            console.log(e);
        });
    };

    // Vérification si une différence est présente
    // some s'arrete automatiquement si il y a une différence
    // Vérification si une différence est présente
    const updateDataRequiered = fieldsToCompare.some(field => {
        if (typeof field.oldValue === "object" && field.oldValue !== null) {
            // Utiliser JSON.stringify pour comparer les contenus des objets
            return JSON.stringify(field.oldValue) !== JSON.stringify(field.newValue);
        }
        // Comparaison simple pour les types primitifs
        return field.oldValue != field.newValue;
    });


    if (updateDataRequiered) {
        if (devMode) console.log("[ACTIVITY] Informations d'activité différentes : Lancement de l'enregistrement en BdD");
        eventInsertActivityModification(activityToInsertFormat);
    } else {
        if (devMode) console.log("[ACTIVITY] Aucune modification de d'activité nécessaire !");
         //Gestion de l'affichage 
        onLeaveMenu("Activity");
    }

}







// retrait de l'indication de champ obligatoire si activé, lorsque l'utilisateur
//  modifie quelque chose dans le champ date
function onInputDateChange() {

    if (inputDateRef.classList.contains("fieldRequired")) {
        inputDateRef.classList.remove("fieldRequired");
    }
    
}



// Séquence d'insertion d'une nouvelle activité
//Soi depuis l'éditeur d'activité, soit une activité généré depuis les sessions

async function eventInsertNewActivity(dataToInsert,isFromSession) {
    await onInsertNewActivityInDB(dataToInsert);
    await onLoadActivityFromDB();


    // est ce que la derniere activité est planifié donc pas de check reward
    const isCheckRewardsRequiered = dataToInsert.isPlanned === false;
    if (devMode === true){console.log("[REWARDS] Valeur de planification derniere activité  " + isCheckRewardsRequiered);};

    if (isCheckRewardsRequiered) {
        onCheckReward(dataToInsert.name);
    }
    

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Lancement de l'actualisation sur le filtre en cours
    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);


    // Si c'est une activité généré depuis les session, met fin à la fonction
    if (isFromSession) {
        // Popup notification
        onShowNotifyPopup(notifyTextArray.activityGenerated);
        return
    }

    // Popup notification
    onShowNotifyPopup(notifyTextArray.creation);

    //Gestion de l'affichage 
    onLeaveMenu("Activity");
}



// Séquence d'insertion d'une modification
async function eventInsertActivityModification(dataToInsert) {

    console.log("modification dataToInsert:", dataToInsert);

    await onInsertActivityModificationInDB(dataToInsert,currentActivityEditorID);
    await onLoadActivityFromDB();

    // est ce que la derniere activité est planifié donc pas de check reward
    const isCheckRewardsRequiered = dataToInsert.isPlanned === false;
    if (devMode === true){console.log("[REWARDS] Valeur de planification derniere activité  " + isCheckRewardsRequiered);};

    if (isCheckRewardsRequiered) {
        onCheckReward(dataToInsert.name);
    }
    

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Lancement de l'actualisation sur le filtre en cours
    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);

    // Popup notification
    onShowNotifyPopup(notifyTextArray.modification);

    //Gestion de l'affichage 
    onLeaveMenu("Activity");
}





// --------------------- SUPPRESSION ACTIVITE --------------------------


// Suppression d'activité
function onClickDeleteFromActivityEditor() {
    
    if (devMode === true){console.log("demande de suppression d'activité ");};
    // L'affiche de la div doit se faire en "flex" donc je n'utilise pas le onChangeDisplay
    document.getElementById("divConfirmDeleteActivity").classList.add("show");

    onChangeDisplay([],[],[],["divActivityEditor","divBtnActivity"],[],[],[]);

};


function onConfirmDeleteActivity(event){

    event.stopPropagation();// Empêche la propagation du clic vers la div d'annulation

    onLockDivDoubleClick(["divActivityEditor","divBtnActivity"]);//sécurité double click

    if (devMode === true){console.log("Confirmation de suppression d'activité ");};
    // retire la class "show" pour la div de confirmation
    document.getElementById("divConfirmDeleteActivity").classList.remove("show");
    eventDeleteActivity(currentActivityEditorID);


};


// Sequence de suppression d'un template
async function eventDeleteActivity(idToDelete) {
    await deleteActivity(idToDelete);
    await onLoadActivityFromDB();

    // Generation du trie dynamique
    onGenerateDynamiqueFilter(allUserActivityArray);

    // Lancement de l'actualisation sur le filtre en cours
    onFilterActivity(currentSortType,currentFilter,allUserActivityArray);

    // Popup notification
    onShowNotifyPopup(notifyTextArray.delete);

    //Gestion de l'affichage 
    onLeaveMenu("Activity");

}







function onAnnulDeleteActivity(event) {
    
    if (devMode === true){console.log("annulation de la suppression d'activité ");};
    // retire la class "show" pour la div de confirmation
    document.getElementById("divConfirmDeleteActivity").classList.remove("show");
    onChangeDisplay([],[],[],[],["divActivityEditor","divBtnActivity"],[],[]);

};





// gestion du format des heures en passe par des inputs number






// Fonction récupérer les valeur des inputs number et les convertir au format input time
function inputActivityNumberToTime() {

    let hhh = inputDurationActivityHoursRef.value.padStart(2, '0');
    let mm = inputDurationActivityMinutesRef.value.padStart(2, '0');
    let ss = inputDurationActivitySecondsRef.value.padStart(2, '0');

    // Mettre à jour l'affichage dans le champ text
    return `${hhh}:${mm}:${ss}`;
}




